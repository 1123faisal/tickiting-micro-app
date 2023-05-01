import mongoose from "mongoose";
import { Password } from "../services/password";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashed = await Password.hash(this.password);
    this.set("password", hashed);
  }
});

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
