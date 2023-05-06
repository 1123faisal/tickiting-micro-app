import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";
import { Order, OrderStatus } from "../../models/order";

// it("return 404 when purchasing an order that does not exist.", async () => {
//   await request(app)
//     .post("/api/payments")
//     .set("Cookie", await signin())
//     .send({
//       token: "dfgdfg",
//       orderId: new mongoose.Types.ObjectId().toHexString(),
//     })
//     .expect(404);
// });

// it("return 401 when purchasing an order that doesn't belong to the user.", async () => {
//   const order = await Order.create({
//     userId: new mongoose.Types.ObjectId().toHexString(),
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created,
//   });

//   await request(app)
//     .post("/api/payments")
//     .set("Cookie", await signin())
//     .send({
//       token: "dfgdfg",
//       orderId: order.id,
//     })
//     .expect(401);
// });

// it("return 400 when purchasing a cancelled order", async () => {
//   const userId = new mongoose.Types.ObjectId().toHexString();

//   const order = await Order.create({
//     userId: userId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Cancelled,
//   });

//   await request(app)
//     .post("/api/payments")
//     .set("Cookie", await signin(userId))
//     .send({
//       token: "dfgdfg",
//       orderId: order._id,
//     })
//     .expect(400);
// });

it("return a 204 with valid input", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = await Order.create({
    userId: userId,
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });

  const res = await request(app)
    .post("/api/payments")
    .set("Cookie", await signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.paymentIntents.list({ limit: 50 });

  const charge = stripeCharges.data.find((d) => d.amount == price * 100);

  expect(charge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge?.id,
  });

  expect(payment).not.toBeNull();
});
