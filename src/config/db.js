const mongoose = require("mongoose")

function connectDb() {
    mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log("DB Connected")
    }).catch((err) => {
        console.log("Db connection failed", err)
    })
}

module.exports = connectDb