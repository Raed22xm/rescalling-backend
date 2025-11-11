const sharp = require("sharp")
const axios = require("axios")
const cloudinary = require("cloudinary").v2;
const resizeModel = require("../models/resize.model.js")
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


exports.resizeImage = async function (req, res) {
    const { imageLink, manageAspectRatio, size, presetSize, width, height, outputFormat, userId } = req.body

    if (!imageLink) {
        res.json({
            message: "Invalid Link"
        })
    }


    const response = await axios.get(imageLink, { responseType: "arraybuffer" })
    const imageBuffer = Buffer.from(response.data)
    const sharpInstance = sharp(imageBuffer);

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