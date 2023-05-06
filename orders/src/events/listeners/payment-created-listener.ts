import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
  TicketUpdatedEvent,
} from "@1123faisalticket/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { id, orderId, stripeId } = data;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    await order.set({ status: OrderStatus.Complete }).save();

    msg.ack();
  }

  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

  queueGroupName: string = queueGroupName;
}
