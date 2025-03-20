const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../server");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await new User({
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();
  });

  it("should login a user with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "testuser",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("username", "testuser");
  });

  it("should return 401 for invalid username", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "wronguser",
        password: "password123",
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid Username or Password");
  });

  it("should return 401 for incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "testuser",
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Incorrect Password");
  });

  it("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Username and password are required");
  });
});