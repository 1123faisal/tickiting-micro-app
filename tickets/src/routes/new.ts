import { requireAuth, validateRequest } from "@1123faisalticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publisher/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title", "title is required").trim().notEmpty(),
    body("price", "price is required").isFloat({ gt: -1 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const newTicket = await Ticket.create({
      title,
      price,
      userId: req.currentUser?.id,
    });

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: newTicket.id,
      price: newTicket.price,
      title: newTicket.title,
      userId: newTicket.userId,
      version: newTicket.version,
    });

    res.status(201).send(newTicket);
  }
);

export { router as createTicketRouter };
