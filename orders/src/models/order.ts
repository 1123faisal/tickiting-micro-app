import { OrderStatus } from "@1123faisalticket/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import mongoose, { Document } from "mongoose";
import { ITicket } from "./ticket";

export { OrderStatus };

export interface IOrder extends Document {
  userId: string;
  version: number;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicket;
}

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Date, required: true },
    ticket: { type: mongoose.SchemaTypes.ObjectId, ref: "Ticket" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// OrderSchema.pre("save", async function () {
//   if (this.isModified("password")) {
//     const hashed = await Password.hash(this.password);
//     this.set("password", hashed);
//   }
// });

OrderSchema.set("versionKey", "version");
OrderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export { Order };
