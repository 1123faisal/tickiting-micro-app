import {
  NotFoundError,
  currentUser,
  errorHandler,
} from "@1123faisalticket/common";
import cookieSession from "cookie-session";
import express from "express";
import "express-async-errors";
import { createSessionRouter } from "./routes/session";
import { createPaymentWebhookRouter } from "./routes/webhook";

const app = express();

app.set("trust proxy", true);

// webhook route before body parse
app.use(createPaymentWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
);

app.use(currentUser);

app.use(createSessionRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
