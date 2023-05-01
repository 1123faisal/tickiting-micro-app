import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

(async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined.");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined.");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined.");
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined.");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on("close", () => {
      console.log("Nats connection close!");
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb.");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000.");
  });
})();

// publish key = pk_test_51N2uOkSEzK72mp3PzNq1XcZYrMY62Q5X7xIfLPanwdjxgNsM5piwfypZOKhdpmdWVi0l0ScyFHmbnX2pMqaL2C5Q003q6qOcZ4
// secret key = sk_test_51N2uOkSEzK72mp3P4mgCYv2eEnVJODrySBubR5KRQ7b1Bg8Rr5Ikus4AcDaaYWkUd4c7KCjeul5YE713aEYRIAsm00KrMsvnFm