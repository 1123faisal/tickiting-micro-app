import express, { Request, Response } from "express";
import {
  NotAuthorizeError,
  NotFoundError,
  requireAuth,
} from "@1123faisalticket/common";
import { Order } from "../models/order";
const router = express.Router();

router.get(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await Order.findById(id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizeError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
