import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@1123faisalticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Payment } from "../models/payment";
import { stripe } from "../stripe";
import { Order } from "../models/order";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token", "token is required").trim().notEmpty()],
  [body("orderId", "orderId is required").trim().notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizeError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("cannot pay for an cancelled order");
    }
    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: "usd",
      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
    });

    // Confirm the Payment Intent
    const { client_secret, next_action } = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method: "pm_card_visa", // Use test card number for testing
        // return_url: "https://ticket.dev/api/payments/complete", // Replace with your website's return URL
      }
    );

    // Create a PaymentIntent with the order amount and currency
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: order.price * 100,
    //   currency: "usd",
    //   automatic_payment_methods: {
    //     enabled: true,
    //   },
    // });

    // if(paymentIntent.status == 'succeeded')

    const payment = await Payment.create({
      orderId: order.id,
      stripeId: paymentIntent.id,
    });

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true, payment });
  }
);

export { router as createChargeRouter };
