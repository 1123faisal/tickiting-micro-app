import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from "@1123faisalticket/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  async onMessage(
    data: TicketUpdatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) {
      throw new Error("ticket not found.");
    }

    await ticket.set({ title, price }).save();

    msg.ack();
  }

  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

  queueGroupName: string = queueGroupName;
}
