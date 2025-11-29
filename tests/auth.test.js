const request = require("supertest")
const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const app = require("../src/app.js")
const connectDb = require("../src/config/db.js")

// Mock cloudinary/axios for any incidental usage (not needed in auth tests, but safe)
jest.mock("axios", () => ({ get: jest.fn() }))
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(() => ({ end: jest.fn() })),
    },
    config: jest.fn(),
  },
}))

describe("auth flow", () => {
  let mongoServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    process.env.MONGO_URI = mongoServer.getUri()
    process.env.ACCESS_TOKEN_SECRET_KEY = "test-access-secret"
    process.env.REFRESH_TOKEN_SECRET_KEY = "test-refresh-secret"
    process.env.ACCESS_TOKEN_EXPIRE = "15m"
    process.env.REFRESH_TOKEN_EXPIRE = "7d"
    await connectDb()
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    if (mongoServer) await mongoServer.stop()
  })

  afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  })

  it("signs up, logs in, and refreshes token", async () => {
    const email = "user@example.com"
    const password = "password123"

    const signupRes = await request(app)
      .post("/api/v1/users/signup")
      .send({ name: "User", email, password })
      .expect(200)

    expect(signupRes.text).toMatch(/Create User is ready/i)

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({ email, password })
      .expect(200)

    expect(loginRes.body).toHaveProperty("accessToken")
    expect(loginRes.body).toHaveProperty("refreshToken")

    const refreshRes = await request(app)
      .post("/api/v1/users/refresh-token")
      .send({ refreshToken: loginRes.body.refreshToken })
      .expect(200)

    expect(refreshRes.body).toHaveProperty("accessToken")
  })
})
