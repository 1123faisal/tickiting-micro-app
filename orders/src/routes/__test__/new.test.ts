import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("return an error if ticket does not exists.", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({ ticketId })
    .expect(404);
});

it("return an error if ticket is already reserved.", async () => {
  const ticket = await Ticket.create({
    price: 23,
    title: "test",
  });
  const order = await Order.create({
    ticket,
    expiresAt: new Date(),
    status: OrderStatus.Created,
    userId: "sdsd",
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = await Ticket.create({
    price: 23,
    title: "test",
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = await Ticket.create({
    price: 23,
    title: "test",
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", await signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
