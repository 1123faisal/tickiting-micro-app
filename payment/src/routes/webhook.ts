import express, { Request, Response } from "express";
import { stripe } from "../stripe";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { Payment } from "../models/payment";
import Stripe from "stripe";
import { Order } from "../models/order";
const router = express.Router();

router.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const payload = JSON.parse((req.body as Buffer).toString("utf8"));

    const { data, type } = payload;
    const { metadata, payment_intent, status } = data.object;
    const { orderId } = metadata;

    const sig = req.headers["stripe-signature"];
    const endpointSecret =
      "whsec_25e74fa099270a657a0dfdae33079efa85f3e4245fbc7faccf1577df53764dad";

    let event: Stripe.Event;

    try {
      if (!sig) {
        throw new Error("sig not defined.");
      }

      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log({ err });
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // console.log(`Unhandled event type ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log(`handled event type ${event.type}`);
        const order = await Order.findById(orderId);

        const payment = await Payment.create({
          orderId: order!.id,
          stripeId: payment_intent,
        });

        new PaymentCreatedPublisher(natsWrapper.client).publish({
          id: payment.id,
          orderId: payment.orderId,
          stripeId: payment.stripeId,
        });

        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send(req.body);
  }
);

export { router as createPaymentWebhookRouter };
