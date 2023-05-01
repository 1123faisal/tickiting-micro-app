import {
    OrderCancelledEvent,
    Publisher,
    Subjects
} from "@1123faisalticket/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
