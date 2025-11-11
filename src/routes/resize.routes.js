const express = require("express")
const { resizeImage } = require("../controllers/resize.controller")
const {getAllResizes} = require("../controllers/resize.controller")
const router  = express.Router()


router.get("/:id" , function(req ,res){
    res.send("RESIZE GET")
})
router.get("/all/:userId" , getAllResizes )


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