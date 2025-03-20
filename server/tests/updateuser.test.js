const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../server");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let mongoServer;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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

describe("PUT /api/auth/update-user", () => {
  let token;

  beforeEach(async () => {
    await new User({
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();
    token = jwt.sign({ username: "testuser", email: "test@example.com" }, JWT_SECRET, { expiresIn: "12h" });
  });

  it("should update user profile", async () => {
    const res = await request(app)
      .put("/api/auth/update-user")
      .send({
        token,
        username: "newusername",
        email: "newemail@example.com",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User details updated successfully");
    expect(res.body).toHaveProperty("token");
  });

  it("should return 409 if new username already exists", async () => {
    await new User({
      username: "existinguser",
      email: "existing@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    const res = await request(app)
      .put("/api/auth/update-user")
      .send({
        token,
        username: "existinguser",
      });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "Username already exists");
  });

  it("should return 400 if token is missing", async () => {
    const res = await request(app)
      .put("/api/auth/update-user")
      .send({ username: "newusername" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Authentication token is required");
  });
});