require("dotenv").config()
const mongoose = require("mongoose")
const logger = require("./src/utils/logger.js")
const connectDb = require("./src/config/db.js")
const app = require("./src/app.js")

connectDb()

const server = app.listen(process.env.PORT || 4001 , function(){
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
