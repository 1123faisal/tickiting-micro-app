import { ExpirationCompleteEvent, OrderStatus } from "@1123faisalticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await Ticket.create({
    title: "concert",
    price: 20,
  });

  const order = await Order.create({
    ticket,
    status: OrderStatus.Created,
    userId: "asasas",
    expiresAt: new Date(),
  });

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    message,
    order,
    ticket,
  };
};

it("emit an order cancelled event", async () => {
  const { data, listener, message, order, ticket } = await setup();
  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.id).toEqual(order.id);
});

it("update the order status to cancelled", async () => {
  const { data, listener, message, order, ticket } = await setup();
  await listener.onMessage(data, message);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("ack the message", async () => {
  const { data, listener, message, order, ticket } = await setup();
  await listener.onMessage(data, message);
  expect(message.ack).toHaveBeenCalled();
});
