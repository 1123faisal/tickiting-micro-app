import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@1123faisalticket/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email", "Please enter valid email").trim().isEmail().normalizeEmail(),
    body("password", "Please enter valid password")
      .trim()
      .isLength({ min: 6, max: 20 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email In Use.");
    }

    const user = await User.create({ email, password });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!,
      {
        expiresIn: "1h",
      }
    );

    req.session = { jwt: jwtToken };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
