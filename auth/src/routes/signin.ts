import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { User } from "../models/user";
import { Password } from "../services/password";
import { BadRequestError, validateRequest } from "@1123faisalticket/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email", "Please enter valid email.")
      .trim()
      .isEmail()
      .normalizeEmail(),
    body("password", "Password is required.").trim().notEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new BadRequestError("Invalid Credentials.");
    }

    const isMatched = await Password.compare(existingUser.password, password);

    if (!isMatched) {
      throw new BadRequestError("Invalid Credentials.");
    }

    const jwtToken = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!,
      {
        expiresIn: "1h",
      }
    );

    req.session = { jwt: jwtToken };

    res.status(200).send(existingUser);
  }
);
export { router as signInRouter };
