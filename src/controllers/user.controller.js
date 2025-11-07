const userModel = require("../models/user.model.js")

async function createUser(req , res){
    const newUser = req.body
    console.log(newUser)
    console.log(userModel)
    await userModel.create(newUser)  // a call to mongodb now tht use this model linked schema linnked table and use this data and add in it in db simple
    
    
    res.send("Create User is ready")    
}


module.exports = createUser