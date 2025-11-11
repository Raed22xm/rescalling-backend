const express = require("express")
const { resizeImage } = require("../controllers/resize.routes")

const router  = express.Router()


router.get("/" , function(req ,res){
    res.send("RESIZE GET")
})

router.post("/resizeImg" , resizeImage)

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