const userModel = require("../models/user.model.js")
const bcrypt = require("bcrypt")
const { generateAccessToken, generateRefreshToken } = require("../service/auth.js")
const jwt = require("jsonwebtoken")
exports.createAccount = async function (req, res) {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: "Missing required fields: name, email, and password are required" 
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                message: "User with this email already exists" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({ 
            message: "User created successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ 
                message: "User with this email already exists" 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: error.message || "Validation error" 
            });
        }
        
        res.status(500).json({ 
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

// login function which will be used to login the user to the system which will return a token and refresh token
exports.loginAccount = async function (req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        let accessToken = generateAccessToken({ userId: user._id, email: user.email })

        let refreshToken = generateRefreshToken({ userId: user._id })

        user.refreshToken = refreshToken  // in db as well , to store in db cause for long term use // before that user collection will be aupdated with refreshToken

        await user.save()

        res.json({
            message: "login successfull",
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

// logout function which will be used to logout the user from the system
exports.logout = async function (req, res) {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(401).json({ message: "Invalid refresh token, required refresh token" })
    }

    const user = await userModel.findOne({ refreshToken })

    if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" })
    }

    user.refreshToken = null

    await user.save()

    return res.status(200).json({ message: "Logout successful, refresh token cleared" })
}


exports.refreshToken = async function(req , res){
    try{
        const {refreshToken} = req.body

        const user = await userModel.findOne({refreshToken})

        if(!user){
            return res.send({message : "Invalid Refresh Token"})
        }


        jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY , function(err){
            if(err){
                return res.send({message : "Refresh Token Expired"})
            }

            const newTokenAccess = generateAccessToken({ userId: user._id, email: user.email })

            res.json({
                message : "Token Refreshed Successfully"
                ,
                accessToken : newTokenAccess
            })
        })

    }catch(err){
        console.log(err)
        res.send("Server error " , err)
    }
}
