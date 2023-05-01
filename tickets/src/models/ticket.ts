import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface ITicket extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

const TicketSchema = new mongoose.Schema<ITicket>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);

// TicketSchema.pre("save", async function () {
//   if (this.isModified("password")) {
//     const hashed = await Password.hash(this.password);
//     this.set("password", hashed);
//   }
// });

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);

const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);

export { Ticket };
