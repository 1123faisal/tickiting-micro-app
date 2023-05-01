import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("ticking", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("publisher connected to nats");

  // const data = JSON.stringify({
  //   id: "34f",
  //   title: "title",
  //   price: 33,
  // });

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "test",
      price: 23,
    });
  } catch (error) {
    console.error(error);
  }

  // stan.publish("ticket:created", data, () => {
  //   console.log("event published.");
  // });
});
