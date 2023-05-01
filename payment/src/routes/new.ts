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
import { Order } from "../models/order";
import { stripe } from "../stripe";
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

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // if(paymentIntent.status == 'succeeded')

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
