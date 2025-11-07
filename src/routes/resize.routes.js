const express = require("express")
const router  = express.Router()


router.get("/" , function(req ,res){
    res.send("RESIZE GET")
})

router.post("/" , function(req ,res){
    res.send("RESIZE GET")
})

router.put("/" , function(req ,res){
    res.send("RESIZE GET")
})

router.patch("/" , function(req ,res){
    res.send("RESIZE GET")
})

router.delete("/" , function(req ,res){
    res.send("RESIZE GET")
})

module.exports = router