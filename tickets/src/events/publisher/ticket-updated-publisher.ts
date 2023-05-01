import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@1123faisalticket/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
