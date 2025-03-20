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

describe("DELETE /api/auth/admin/deleteuser/:username", () => {
  beforeEach(async () => {
    await new User({
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();
  });

  it("should delete a user", async () => {
    const res = await request(app).delete("/api/auth/admin/deleteuser/testuser");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");
  });

  it("should return 404 if user does not exist", async () => {
    const res = await request(app).delete("/api/auth/admin/deleteuser/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });
});