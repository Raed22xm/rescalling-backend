const express = require("express")
const app = express()
require("dotenv").config()
const userRoutes = require("./src/routes/user.routes.js")
const resizeRoutes = require("./src/routes/resize.routes.js")
const cors = require("cors")

app.use(express.json())
app.use(cors( {
    origin: "http://localhost:3000",
    credentials: true,
}))

const connectDb = require("./src/config/db.js")



// production -> folder managment -> folder things
connectDb()

// Routes -> for all routes for a specific entity
// Controllers -> That is for logic of each route
// models -> that is use for transaction with DB 
app.use("/api/v1/users" , userRoutes)
app.use("/api/v1/resize" , resizeRoutes)


app.listen(4001 , function(){
    
    console.log("Server listening @ localhost:4001")
})