import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@1123faisalticket/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
