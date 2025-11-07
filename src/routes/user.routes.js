const express = require("express")
const router = express.Router()
const createUser = require("../controllers/user.controller.js")
router.get("/" , function(req , res){
    // console.log("Api called")
    res.send("USER GET")
})

router.post("/" , createUser)
router.put("/" , function(req , res){
    // console.log("Api called")
    res.send("USER PUT")
})
router.patch("/" , function(req , res){
    // console.log("Api called")
    res.send("USER PATCH")
})
router.delete("/" , function(req , res){
    // console.log("Api called")
    res.send("USER DELETE")
})



module.exports = router