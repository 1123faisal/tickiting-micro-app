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
  "/api/payments/session",
  requireAuth,
  [body("orderId", "orderId is required").trim().notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;

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

    console.log(order.id, order.id.toString());

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "T-shirt",
            },
            unit_amount: order.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id.toString(),
      },
      mode: "payment",
      success_url: `https://ticket.dev/orders/${order.id}?success=true`,
      cancel_url: `https://ticket.dev/orders/${order.id}?canceled=true`,
    });

    res.redirect(302, session.url!.toString());

    // res.status(200).send({ clientSecret: paymentIntent.client_secret });
  }
);

export { router as createSessionRouter };
