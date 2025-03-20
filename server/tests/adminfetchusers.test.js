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

describe("GET /api/auth/admin", () => {
  beforeEach(async () => {
    await new User({
      username: "testuser1",
      email: "test1@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "user",
    }).save();
    await new User({
      username: "adminuser",
      email: "admin@example.com",
      password: await bcrypt.hash("password123", 10),
      role: "admin",
    }).save();
  });

  it("should fetch all users with role 'user'", async () => {
    const res = await request(app).get("/api/auth/admin");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty("username", "testuser1");
  });
});