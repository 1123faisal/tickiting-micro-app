import request from "supertest";
import { app } from "../../app";

it("fails when supplied email does not exists", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "Test@123",
    })
    .expect(400);
});

it("fails when supplied password is incorrect", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "Test@123",
    })
    .expect(201);

  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "Testddf",
    })
    .expect(400);
});

it("response with cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "Test@123",
    })
    .expect(201);

  const response = await request(app).post("/api/users/signin").send({
    email: "test@test.com",
    password: "Test@123",
  });

  expect(response.get("Set-Cookie")).toBeDefined();
});
