const sharp = require("sharp")
const axios = require("axios")
const cloudinary = require("cloudinary").v2;
const resizeModel = require("../models/resize.model.js");
const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken")
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


exports.resizeImage = async function (req, res) {
// cases 
    // 1 user is authentication logged in then resizes 
    // 2 user is not logged and in resizing 
    // 3 while resizing access oken or refresh token got expired 
    // 4 before doing resizing we should check for token validation
    // resizing is only limited to people (our ) not public 


    // it inceases backend security 
    // validation before processing resize 
        // image validations
        // we can not process a image more then 2 mb
        // we can not process a image more then 2 k resoltuion
        // we can not process a bulk images at one time 

        // client sent 5 images one time 
        //  one time one image 

        // for 24 hours user can do 5 images only 

        // crash your app in future 


    // resizing
    // how to earn through it  

    // we can provide a basic thing that for 1 dollar you can do 10 resizing per day 
    const { imageLink, manageAspectRatio, size, presetSize, width, height, outputFormat, userId } = req.body

    
    if (!imageLink) {
        return res.status(400).json({
            message: "Invalid Link , please send proper image link !"
        })
    }

    if(!userId){
        return res.status(400).json({
            message : "Cant process your request , user id not available !"
        })
    }

    const user = await userModel.findById(userId)

    if(!user){
       return res.status(400).json({
            message : `Invalid user with id ${userId}`
        })
    }

    if(!user.refreshToken){
        return res.status(401).json({message : "Refresh token missing, please login again to process image resizing"})
    }

    try{
        jwt.verify(user.refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY )
    }catch(err){
        return res.status(401).json({message : "Refresh token invalid or expired, please login again to process image resizing"})
    }

    const response = await axios.get(imageLink, { responseType: "arraybuffer" })
    const imageBuffer = Buffer.from(response.data)
    const sharpInstance = sharp(imageBuffer);
    const metadata = await sharpInstance.metadata()

    const sizeInMb = metadata.size / (1024 * 1024)
    if(sizeInMb > 3){
        return res.status(400).json({message : "Image larger then 2 mb"})
    }

    if(metadata.width > 2000 || metadata.height > 2000){
        return res.status(400).json({message : "Image exceeds 2000px in either height and width"})
    }


// quota based resizing 5 / day 

// every time user sents a request for resizing we will note that time of request made and first in our db we will find images 

// form the request time back to 24 hours 
//  lets say we got < 5 images in last 24 hours then we will process the request else not 

    let now = new Date();
    const startOfDay = new Date(now)

    startOfDay.setHours(0,0,0,0)


    let last24hourImagesCount = await resizeModel.countDocuments({userId , date : {$gt : startOfDay}})

    if(last24hourImagesCount >= 5){
        return res.status(429).json({message : "Daily Resize quota reached"})
    }

    let resizeOptions = {};

    if (presetSize && presetSize !== "custom") {
        const presets = {
            small: { width: 300, height: 300 },
            medium: { width: 600, height: 400 },
            large: { width: 1200, height: 800 },
        };
        resizeOptions = presets[presetSize] || {};
    } else if (size === "custom") {
        resizeOptions = {
            width: width ? parseInt(width) : undefined,
            height: height ? parseInt(height) : undefined,
        };
    }

    if (resizeOptions.width || resizeOptions.height) {
        sharpInstance.resize({
            width: resizeOptions.width,
            height: resizeOptions.height,
            fit: manageAspectRatio ? "inside" : "fill", // maintain aspect ratio if true
        });
    }


    const resizedBuffer = await sharpInstance
        .toFormat(outputFormat)
        .toBuffer();

    const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "resized-images",
                resource_type: "image",
                format: outputFormat,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        uploadStream.end(resizedBuffer);
    });

    await resizeModel.create({
        imageLink: uploadResult.secure_url,
        imageFormat: outputFormat,
        date: new Date(),
        options: { imageLink, manageAspectRatio, size, presetSize, width, height, outputFormat },
        userId : userId
    })


    res.status(200).json({
        success: true,
        message: "Image resized and uploaded successfully",
        resizedImageUrl: uploadResult.secure_url,
    });


}

exports.getAllResizes = async function(req , res){
    const userId = req.params.userId
    let resizes = await resizeModel.find({userId})

    res.status(200).json({
        "message" : "successfully fetched all resizes",
        "data" : resizes
    })

}

exports.getSpecificResize = async function(req , res){
    const userId = req.params.userId
    const resizeId = req.params.resizeId

    const resizeData =await resizeModel.findOne({userId , _id : resizeId})

    res.status(200).json({message : "data succeffully fetched" , data : resizeData})
}