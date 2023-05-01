import { TicketUpdatedEvent } from "@1123faisalticket/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = await Ticket.create({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 30,
  });

  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    price: 333,
    title: "new concert",
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return {
    ticket,
    listener,
    data,
    message,
  };
};

it("finds, updates, and saves a ticket.", async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { data, listener, message, ticket } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number.", async () => {
  const { data, listener, message, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, message);
  } catch (error) {}

  expect(message.ack).not.toHaveBeenCalled();
});
