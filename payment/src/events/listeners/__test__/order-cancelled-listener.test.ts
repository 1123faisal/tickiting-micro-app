import { OrderCancelledEvent, OrderStatus } from "@1123faisalticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = await Order.create({
    userId: "12333",
    status: OrderStatus.Created,
    price: 20,
    version: 0,
  });

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    ticket: {
      id: "1233",
    },
    version: 1,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    msg,
    order,
  };
};

it("update the status of the order", async () => {
  const { data, listener, msg, order } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(data.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("acks the message", async () => {
  const { data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
