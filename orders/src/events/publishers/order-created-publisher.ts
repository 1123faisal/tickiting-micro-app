import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from "@1123faisalticket/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
