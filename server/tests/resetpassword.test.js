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

describe("POST /api/auth/reset-password", () => {
  let resetToken;

  beforeEach(async () => {
    await new User({
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();
    resetToken = jwt.sign({ email: "test@example.com" }, JWT_SECRET, { expiresIn: "15m" });
  });

  it("should reset password with valid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        newPassword: "newpassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Password reset successfully");
  });

  it("should return 400 for invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "invalidtoken",
        newPassword: "newpassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid or expired token");
  });

  it("should return 400 if fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({ token: resetToken });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Token and new password are required");
  });
});