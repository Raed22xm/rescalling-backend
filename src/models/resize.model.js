/**
 * This file defines the MongoDB schema/model for storing image resize records.
 * Each document in the 'resize' collection represents one completed image resize operation.
 * This model is used to track all resize operations performed by users, including
 * the original settings, output URL, and metadata.
 */

// Import mongoose library - required for creating schemas and models in MongoDB
// Mongoose provides a schema-based solution to model application data
const mongoose = require("mongoose")

/**
 * Define the schema structure for resize documents.
 * Schema defines the shape, data types, and validation rules for documents in the collection.
 * This acts as a blueprint for how resize records will be stored in MongoDB.
 */
const resizeSchema = mongoose.Schema({
    /**
     * imageLink: The Cloudinary URL where the resized image is stored.
     * This is the final output URL that users can access to download/view the resized image.
     * Example: "https://res.cloudinary.com/cloud_name/image/upload/v123/resized-images/abc123.jpg"
     */
    imageLink : {
        type : String,        // Field type is String to store the URL
        required : true       // This field is mandatory - every resize must have an image URL
    } , 
    
    /**
     * imageFormat: The file format of the resized image (e.g., "jpg", "png", "webp").
     * This indicates the output format that was used when resizing the image.
     * Stored as a string value like "jpg", "png", "webp", etc.
     */
    imageFormat : {
        type : String         // Field type is String to store format name
        // Note: Not required - format might be optional or default to original format
    } , 
    
    /**
     * date: The timestamp when the resize operation was completed.
     * This is used to track when the image was resized and for filtering by date range.
     * Also used for daily quota calculations (checking resizes in last 24 hours).
     */
    date : {
        type : Date          // Field type is Date to store timestamp
        // Stores the exact date and time when the resize was created
    } , 
    
    /**
     * options: An object containing all the resize parameters used for this operation.
     * This includes: imageLink (original), manageAspectRatio, size, width, height, outputFormat.
     * Stored as a flexible Object type to preserve all resize settings for reference.
     * Example: { imageLink: "...", manageAspectRatio: true, size: "custom", width: "1920px", height: "1080px", outputFormat: "jpg" }
     */
    options :{
        type : Object        // Field type is Object to store nested key-value pairs
        // Flexible structure allows storing various resize configuration options
    },
    
    /**
     * userId: Reference to the user who performed this resize operation.
     * This creates a relationship between the resize record and the user who created it.
     * Used to filter resizes by user and enforce user-specific quotas.
     */
    userId : {
        // ObjectId is MongoDB's unique identifier type (12-byte unique identifier)
        type : mongoose.Schema.Types.ObjectId,
        
        // Reference to the "user" collection/model - enables population queries
        // This allows us to join resize data with user data when needed
        ref : "User",
        
        // This field is mandatory - every resize must be associated with a user
        required : true
    }

})

/**
 * Create and export the Mongoose model for the 'resize' collection.
 * This model provides methods to interact with the database:
 * - resizeModel.create() - Create new resize records
 * - resizeModel.find() - Query resize records
 * - resizeModel.findById() - Find by ID
 * - resizeModel.deleteOne() - Delete resize records
 * 
 * @param {string} "resize" - The collection name in MongoDB (will be pluralized to "resizes")
 * @param {Schema} resizeSchema - The schema definition to use for this model
 * @returns {Model} Mongoose model instance for resize operations
 */
module.exports = mongoose.model("resize" , resizeSchema)
