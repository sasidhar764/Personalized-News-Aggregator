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

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.user).toHaveProperty("username", "testuser");
  });

  it("should return 409 if email already exists", async () => {
    await new User({
      username: "existinguser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "newuser",
        email: "test@example.com",
        password: "password123",
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "Email ID already exists");
  });

  it("should return 409 if username already exists", async () => {
    await new User({
      username: "testuser",
      email: "existing@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "new@example.com",
        password: "password123",
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "Username already exists");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "All details are required");
  });
});