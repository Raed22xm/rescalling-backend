const request = require("supertest")
const app = require("../src/app.js")

describe("healthz", () => {
  it("returns health status with ok/db fields", async () => {
    const res = await request(app).get("/healthz")
    expect([200, 503]).toContain(res.status)
    expect(res.body).toHaveProperty("ok")
    expect(res.body).toHaveProperty("db")
  })
})
