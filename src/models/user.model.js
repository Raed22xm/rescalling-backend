// db part 

// defining model for user collection 
// using this model we can tell about how the data will look like in collection

const mongoose = require("mongoose")// importing mongoose

const userSchema = mongoose.Schema({// defining schema for user collection
    name: {// defining name field
        type: String,
        required: [true, 'Please add a name for user']// making name field required
    } ,
    email : {// defining email field
        type : String ,
        required : [true , "Please add a email"] , 
        unique : true// making email field unique, how email will be unique in db, no two users can have same email and 
    } , 
    password  : {// defining password field
        type : String , 
        required : [true , "Please add a password"]// making password field required
    },
    refreshToken: {// defining refreshToken field
        type: String,
        default: null// making refreshToken field default to null
    }
})

// table name// table name is user and userSchema is the schema for user collection, where data will be stored
let userModel = mongoose.model("user" ,  userSchema)// creating model for user collection, model is a collection of schema, where data will be stored, and userSchema is the schema for user collection, where data will be stored
// exporting userModel to be used in other files
module.exports = userModel// exporting userModel to be used in other files