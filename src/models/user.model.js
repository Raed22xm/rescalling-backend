// db part 

// defining model for user collection 
// using this model we can tell about how the data will look like in collection

const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for user']
    } ,
    email : {
        type : String ,
        required : [true , "Please add a email"] , 
        unique : true
    } , 
    password  : {
        type : String , 
        required : [true , "Please add a password"]
    }
})

// table name
let userModel = mongoose.model("user" ,  userSchema)

module.exports = userModel