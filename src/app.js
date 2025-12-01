const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")
require("dotenv").config()
const userRoutes = require("./routes/user.routes.js")
const resizeRoutes = require("./routes/resize.routes.js")
const logger = require("./utils/logger.js")
const { register, httpRequestsTotal, httpRequestDurationMs, mongoConnectionState } = require("./utils/metrics.js")

const app = express()

app.use(helmet())

const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

// Simple request logger + metrics
app.use(function(req, res, next) {
    const start = process.hrtime.bigint()
    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000

        // Log
        logger.info({
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: durationMs.toFixed(2)
        })

        // Metrics
        const routeLabel = req.route?.path || req.originalUrl || "unknown"
        httpRequestsTotal.inc({ method: req.method, route: routeLabel, status: res.statusCode })
        httpRequestDurationMs.observe({ method: req.method, route: routeLabel, status: res.statusCode }, durationMs)
    })
    next()
})

app.use(express.json())
app.use(cors( {
    origin: "http://localhost:3000",
    credentials: true,
}))

// Basic healthcheck with DB status
app.get("/healthz", async function(req, res) {
    const mongoState = mongoose.connection.readyState
    const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    }

    const status = {
        ok: mongoState === 1,
        db: states[mongoState] || "unknown",
        uptime: process.uptime()
    }

    const code = status.ok ? 200 : 503
    res.status(code).json(status)
})

// Metrics endpoint
app.get("/metrics", async function(req, res) {
    // Update mongo connection gauge
    const mongoState = mongoose.connection.readyState
    mongoConnectionState.set(mongoState)
    res.set("Content-Type", register.contentType)
    res.end(await register.metrics())
})

// Routes -> for all routes for a specific entity
app.use("/api/v1/users" , userRoutes)
app.use("/api/v1/resize" , resizeRoutes)

// Error handler
app.use(function(err, req, res) {
    logger.error({ err, url: req.originalUrl }, "Unhandled error")
    res.status(500).json({ message: "Internal server error" })
})

module.exports = app
