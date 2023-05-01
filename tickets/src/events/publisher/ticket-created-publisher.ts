import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@1123faisalticket/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
