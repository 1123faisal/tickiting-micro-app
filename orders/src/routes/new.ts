import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@1123faisalticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [body("ticketId", "ticketId is required").trim().notEmpty().isMongoId()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved");
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const savedOrder = await Order.create({
      expiresAt: expiration,
      status: OrderStatus.Created,
      ticket,
      userId: req.currentUser?.id,
    });

    // publish an event for order create
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      expiresAt: savedOrder.expiresAt.toISOString(),
      id: savedOrder.id,
      status: savedOrder.status,
      version:savedOrder.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
      userId: savedOrder.userId,
    });

    res.status(201).send(savedOrder);
  }
);

export { router as createOrderRouter };
