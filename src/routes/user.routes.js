const express = require("express")
const router = express.Router()

router.get("/" , function(req , res){
    // console.log("Api called")
    res.send("USER GET")
})

router.post("/" , function(req , res){
    // console.log("Api called")
    res.send("USER POST")
})
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