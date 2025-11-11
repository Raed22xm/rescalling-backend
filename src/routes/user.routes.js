const express = require("express")
const router = express.Router()
const {createAccount, logout, refreshToken} = require("../controllers/user.controller.js")
const {loginAccount} = require("../controllers/user.controller.js")

router.get("/" , function(req , res){
    // console.log("Api called")
    res.send("USER GET")
})

router.post("/signup" , createAccount)
router.post("/login" , loginAccount)

router.post("/logout" , logout  )

router.post("/refresh-token" , refreshToken )

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