const mongoose = require("mongoose")
const logger = require("../utils/logger.js")

function connectDb() {
    mongoose.connect(process.env.MONGO_URI).then((data) => {
        logger.info({ db: data.connection.name }, "DB connected")
    }).catch((err) => {
        logger.error({ err }, "DB connection failed")
    })
}

module.exports = connectDb
