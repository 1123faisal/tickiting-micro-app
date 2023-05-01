import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from "@1123faisalticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  async onMessage(
    data: { id: string; title: string; price: number; userId: string },
    msg: Message
  ): Promise<void> {
    const { id, title, price } = data;

    await Ticket.create({ title, price, _id: id });

    msg.ack();
  }

  subject: Subjects.TicketCreated = Subjects.TicketCreated;

  queueGroupName: string = queueGroupName;
}
