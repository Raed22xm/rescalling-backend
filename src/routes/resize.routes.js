const express = require("express")
const { resizeImage } = require("../controllers/resize.controller")
const {getAllResizes} = require("../controllers/resize.controller")
const {jwtverifyAccessToken}  = require("../middleware/auth.js")
const {getSpecificResize} = require("../controllers/resize.controller")
const {deleteResize} = require("../controllers/resize.controller.js")
const router  = express.Router()

// Authentication common way that is like in every api other then sign up and  login we need to access the access token in every call 

router.get("/all/:userId" , jwtverifyAccessToken , getAllResizes )

router.get("/:userId/:resizeId" ,jwtverifyAccessToken , getSpecificResize)

router.post("/resizeImg" , jwtverifyAccessToken , resizeImage)

router.delete("/:resizeId" ,deleteResize)

module.exports = router