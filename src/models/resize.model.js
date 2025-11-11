
const mongoose = require("mongoose")

const resizeSchema = mongoose.Schema({
    imageLink : {
        type : String,
        required : true
    } , 
    imageFormat : {
        type : String 
    } , 
    date : {
        type : Date
    } , 
    options :{
        type : Object
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User",
        required : true
    }

})

module.exports = mongoose.model("resize" , resizeSchema)
