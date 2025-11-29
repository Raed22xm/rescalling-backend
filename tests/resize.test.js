const request = require("supertest")
const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")
const app = require("../src/app.js")
const connectDb = require("../src/config/db.js")

// Mock axios to return a tiny 1x1 png buffer
jest.mock("axios", () => {
  const mockTinyPng = Buffer.from(
    "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000a49444154789c636000000200015e02a2dc0000000049454e44ae426082",
    "hex"
  )
  return {
    get: jest.fn(() => Promise.resolve({ data: mockTinyPng })),
  }
})

// Mock sharp to bypass real image processing
jest.mock("sharp", () => {
  return jest.fn(() => ({
    metadata: async () => ({ size: 500, width: 100, height: 100 }),
    resize: function() { return this },
    toFormat: function() {
      return {
        toBuffer: async () => Buffer.from("resized"),
      }
    },
  }))
})

// Mock cloudinary uploader
const mockUploadStream = jest.fn((opts, cb) => {
  return {
    end: () => cb(null, { secure_url: "https://cloudinary.example/resized.png" })
  }
})

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: (...args) => mockUploadStream(...args),
    },
    config: jest.fn(),
  },
}))

describe("resize quota", () => {
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

  it("enforces daily quota after 5 resizes", async () => {
    const email = "quota@example.com"
    const password = "password123"

    await request(app)
      .post("/api/v1/users/signup")
      .send({ name: "Quota User", email, password })
      .expect(200)

    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({ email, password })
      .expect(200)

    const userId = loginRes.body.user._id
    const accessToken = loginRes.body.accessToken
    const resizePayload = {
      imageLink: "https://example.com/tiny.png",
      manageAspectRatio: true,
      size: "custom",
      width: "10",
      height: "10",
      outputFormat: "png",
      userId,
    }

    // First 5 should pass (200)
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/v1/resize/resizeImg")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(resizePayload)
      expect(res.status).toBe(200)
    }

    // 6th should hit quota 429
    const quotaRes = await request(app)
      .post("/api/v1/resize/resizeImg")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(resizePayload)

    expect(quotaRes.status).toBe(429)
    expect(quotaRes.body.message).toMatch(/Daily Resize quota reached/i)
  })
})
