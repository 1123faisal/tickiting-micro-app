import {
  NotFoundError,
  currentUser,
  errorHandler,
} from "@1123faisalticket/common";
import cookieSession from "cookie-session";
import express from "express";
import "express-async-errors";
import { createChargeRouter } from "./routes/new";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
  })
);

app.use(currentUser);

app.use(createChargeRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
