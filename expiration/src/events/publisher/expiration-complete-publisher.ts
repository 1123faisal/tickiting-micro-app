import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@1123faisalticket/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
