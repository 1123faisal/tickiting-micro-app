import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

declare global {
  function signin(id?: string): Promise<string[]>;
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51N2uOkSEzK72mp3P4mgCYv2eEnVJODrySBubR5KRQ7b1Bg8Rr5Ikus4AcDaaYWkUd4c7KCjeul5YE713aEYRIAsm00KrMsvnFm";

let mongo: any;

beforeAll(async () => {
  jest.clearAllMocks();

  const envs = process.env;
  envs.JWT_KEY = "testing";
  process.env = envs;
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let col of collections) {
    await col.deleteMany();
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = async (id?: string) => {
  // build jwt payload {id,email}

  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // create jwt token

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // build session {jwt:myjw t}

  const session = { jwt: token };

  // turn that session into json

  const sessionJson = JSON.stringify(session);

  // take json and encode it as base64

  const base64 = Buffer.from(sessionJson).toString("base64");

  // return a string thats the cookie with encoded data
  return [`session=${base64}; path=/; secure; httponly`];
};
