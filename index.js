const express = require("express")
const app = express()
require("dotenv").config()
const mongoose = require("mongoose")
const userRoutes = require("./src/routes/user.routes.js")
const resizeRoutes = require("./src/routes/resize.routes.js")
const cors = require("cors")
const logger = require("./src/utils/logger.js")

// Simple request logger
app.use(function(req, res, next) {
    const start = process.hrtime.bigint()
    res.on("finish", () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000
        logger.info({
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: durationMs.toFixed(2)
        })
    })
    next()
})

app.use(express.json())
app.use(cors( {
    origin: "http://localhost:3000",
    credentials: true,
}))

const connectDb = require("./src/config/db.js")



// production -> folder managment -> folder things
connectDb()

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

// Routes -> for all routes for a specific entity
// Controllers -> That is for logic of each route
// models -> that is use for transaction with DB 
app.use("/api/v1/users" , userRoutes)
app.use("/api/v1/resize" , resizeRoutes)

// Error handler
app.use(function(err, req, res, next) {
    logger.error({ err, url: req.originalUrl }, "Unhandled error")
    res.status(500).json({ message: "Internal server error" })
})

app.listen(4001 , function(){
    
    logger.info("Server listening @ localhost:4001")
})
