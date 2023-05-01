import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post request", async () => {
  const response = await request(app).post("/api/tickets").send();
  expect(response.statusCode).not.toEqual(404);
});

it("can only be access if the user is sign in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("return a status othen then 401 if user is sign in", async () => {
  const cookie = await signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});

  expect(response.statusCode).not.toEqual(401);
});

it("return an error is invalid title is provided", async () => {
  const cookie = await signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "", price: 12 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 12 })
    .expect(400);
});

it("return a error if invalid price is provided", async () => {
  const cookie = await signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: -10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "tstsgsgs" })
    .expect(400);
});

it("create a ticket with valid inputs", async () => {
  // add a check to make sure ticket was saved

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const cookie = await signin();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);

  expect(tickets[0].price).toEqual(20);
  expect(tickets[0].title).toEqual("test");
});

it("publish the event", async () => {
  const cookie = await signin();

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test", price: 20 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
