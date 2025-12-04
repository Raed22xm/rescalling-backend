const sharp = require("sharp")
const axios = require("axios")
const cloudinary = require("cloudinary").v2;
const resizeModel = require("../models/resize.model.js");
const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken")
const logger = require("../utils/logger.js"); // Import logger
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


exports.resizeImage = async function (req, res) {
    try {
        const { imageLink, manageAspectRatio, size, presetSize, width, height, outputFormat, userId } = req.body

        if (!imageLink) {
            return res.status(400).json({
                message: "Invalid Link , please send proper image link !"
            })
        }

        if (!userId) {
            return res.status(400).json({
                message: "Cant process your request , user id not available !"
            })
        }

        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(400).json({
                message: `Invalid user with id ${userId}`
            })
        }

        if (!user.refreshToken) {
            return res.status(401).json({ message: "Refresh token missing, please login again to process image resizing" })
        }

        try {
            jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY)
        } catch {
            return res.status(401).json({ message: "Refresh token invalid or expired, please login again to process image resizing" })
        }

        // Fetch image with error handling
        let response;
        try {
            response = await axios.get(imageLink, { responseType: "arraybuffer", timeout: 30000 })
        } catch (error) {
            return res.status(400).json({
                message: "Failed to fetch image from the provided link. Please check the image URL."
            })
        }

        const imageBuffer = Buffer.from(response.data)
        const sharpInstance = sharp(imageBuffer);

        let metadata;
        try {
            metadata = await sharpInstance.metadata()
        } catch (error) {
            return res.status(400).json({
                message: "Invalid image format or corrupted image file."
            })
        }

        const sizeInMb = metadata.size / (1024 * 1024)
        if (sizeInMb > 3) {
            return res.status(400).json({ message: "Image larger then 3 mb" })
        }

        if (metadata.width > 2000 || metadata.height > 2000) {
            return res.status(400).json({ message: "Image exceeds 2000px in either height and width" })
        }

        // quota based resizing 5 / day
        let now = new Date();
        const startOfDay = new Date(now)
        startOfDay.setHours(0, 0, 0, 0)

        let last24hourImagesCount = await resizeModel.countDocuments({ userId, date: { $gt: startOfDay } })

        if (last24hourImagesCount >= 5) {
            return res.status(429).json({ message: "Daily Resize quota reached" })
        }

        // Parse width/height that may include "px"
        let parsedWidth, parsedHeight;
        if (width && typeof width === "string") {
            parsedWidth = parseInt(width.replace("px", "").trim())
        } else if (width) {
            parsedWidth = parseInt(width)
        }

        if (height && typeof height === "string") {
            parsedHeight = parseInt(height.replace("px", "").trim())
        } else if (height) {
            parsedHeight = parseInt(height)
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
                width: parsedWidth && !isNaN(parsedWidth) ? parsedWidth : undefined,
                height: parsedHeight && !isNaN(parsedHeight) ? parsedHeight : undefined,
            };
        }

        if (resizeOptions.width || resizeOptions.height) {
            sharpInstance.resize({
                width: resizeOptions.width,
                height: resizeOptions.height,
                fit: manageAspectRatio ? "inside" : "fill", // maintain aspect ratio if true
            });
        }

        let resizedBuffer;
        try {
            resizedBuffer = await sharpInstance
                .toFormat(outputFormat || "jpg")
                .toBuffer();
        } catch (error) {
            return res.status(400).json({
                message: "Failed to resize image. Invalid output format or processing error."
            })
        }

        let uploadResult;
        try {
            uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "resized-images",
                        resource_type: "image",
                        format: outputFormat || "jpg",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                uploadStream.end(resizedBuffer);
            });
        } catch (error) {
            logger.error({ err: error }, "Cloudinary upload error");
            return res.status(500).json({
                message: "Failed to upload resized image to cloud storage."
            })
        }

        try {
            await resizeModel.create({
                imageLink: uploadResult.secure_url,
                imageFormat: outputFormat || "jpg",
                date: new Date(),
                options: { imageLink, manageAspectRatio, size, presetSize, width, height, outputFormat },
                userId: userId
            })
        } catch (error) {
            console.error("Database save error:", error);
            // image uploaded but DB write failed; continue returning success
        }

        res.status(200).json({
            success: true,
            message: "Image resized and uploaded successfully",
            resizedImageUrl: uploadResult.secure_url,
        });
    } catch (error) {
        logger.error({ err: error }, "Resize image error");
        res.status(500).json({
            message: "Internal server error while processing image resize",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

exports.getAllResizes = async function (req, res) {
    const userId = req.params.userId
    let resizes = await resizeModel.find({ userId })

    res.status(200).json({
        "message": "successfully fetched all resizes",
        "data": resizes
    })

}

exports.getSpecificResize = async function (req, res) {
    const userId = req.params.userId
    const resizeId = req.params.resizeId

    const resizeData = await resizeModel.findOne({ userId, _id: resizeId })

    res.status(200).json({ message: "data succeffully fetched", data: resizeData })
}

exports.deleteResize = async function (req, res) {
    try {
        const resizeId = req.params.resizeId

        await resizeModel.deleteOne({ _id: resizeId })

        res.status(200).json({ message: `Deleted resize with id ${resizeId}` })
    } catch {
        res.status(500).json({ message: "Server Error" })
    }

}
