import { Ticket } from "../ticket";

it("implement optimistic concurrency control", async () => {
  const ticket = await Ticket.create({
    title: "concert",
    price: 20,
    userId: "123",
  });

  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  ticket1?.set({ price: 10 });
  ticket2?.set({ price: 15 });

  await ticket1?.save();

  try {
    await ticket2?.save();
  } catch (error) {
    return;
  }

  throw new Error("should not reach to this point.");
});

it("increment the version number on multiple saves.", async () => {
  const ticket = await Ticket.create({
    title: "concert",
    price: 20,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);

  await ticket.save();
  expect(ticket.version).toEqual(3);
});
