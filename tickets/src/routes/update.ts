import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@1123faisalticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publisher/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title", "title is required").trim().notEmpty(),
    body("price", "price is required").isFloat({ gt: -1 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("cannot edit a reserved ticket.");
    }

    if (ticket.userId !== req.currentUser?.id) {
      throw new NotAuthorizeError();
    }

    await ticket
      .set({
        title,
        price,
      })
      .save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id,
      price,
      title,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
