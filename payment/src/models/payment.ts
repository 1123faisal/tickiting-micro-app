import { OrderStatus } from "@1123faisalticket/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import mongoose, { Document } from "mongoose";


export interface IPayment extends Document {
  orderId: string;
  stripeId: string;
}

const PaymentSchema = new mongoose.Schema<IPayment>(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true },
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

// PaymentSchema.pre("save", async function () {
//   if (this.isModified("password")) {
//     const hashed = await Password.hash(this.password);
//     this.set("password", hashed);
//   }
// });

PaymentSchema.set("versionKey", "version");
PaymentSchema.plugin(updateIfCurrentPlugin);

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);

export { Payment };
