require("dotenv").config()

// Validate required environment variables
const requiredEnvVars = [
    "MONGO_URI",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "ACCESS_TOKEN_SECRET_KEY",
    "REFRESH_TOKEN_SECRET_KEY"
];

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
    // We use console.error here because the logger might depend on some env vars or we want raw output
    console.error("❌ CRITICAL ERROR: Missing required environment variables:");
    missingEnvVars.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
}

const mongoose = require("mongoose")
const logger = require("./src/utils/logger.js")
const connectDb = require("./src/config/db.js")
const app = require("./src/app.js")

connectDb()

const server = app.listen(process.env.PORT || 4001, function () {
    logger.info(`Server listening @ localhost:${process.env.PORT || 4001}`)
})

function gracefulShutdown(signal) {
    logger.info({ signal }, "Shutting down")
    server.close(() => {
        mongoose.connection.close(false).then(() => {
            logger.info("Closed out remaining connections")
            process.exit(0)
        }).catch(() => process.exit(1))
    })
}

process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)
