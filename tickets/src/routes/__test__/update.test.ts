import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("return 404 if provided id does not exists", async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${mongoId}`)
    .set("Cookie", await signin())
    .send({
      title: "asddsd",
      price: 20,
    })
    .expect(404);
});

it("return 401 if user not authenticated", async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${mongoId}`)
    .send({
      title: "asddsd",
      price: 20,
    })
    .expect(401);
});

it("return 401 if user does not own ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", await signin())
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", await signin())
    .send({ title: "test", price: 20 })
    .expect(401);
});

it("return 400 if user proveide an invalid title or price", async () => {
  const cookie = await signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "text", price: -1 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "dsfsdf" })
    .expect(400);
});

it("update the if valid input provided", async () => {
  const cookie = await signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  const updateRes = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "test2", price: 40 })
    .expect(200);

  expect(updateRes.body.title).toEqual("test2");
  expect(updateRes.body.price).toEqual(40);
});

it("publish the event", async () => {
  const cookie = await signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "test2", price: 40 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("reject update, if ticket is reserved", async () => {
  const cookie = await signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 });

  const ticket = await Ticket.findById(response.body.id);

  await ticket!
    .set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    .save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "test2", price: 40 })
    .expect(400);
});
