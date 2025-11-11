const userModel = require("../models/user.model.js")
const bcrypt = require("bcrypt")
const { generateAccessToken, generateRefreshToken } = require("../service/auth.js")
const jwt = require("jsonwebtoken")
exports.createAccount = async function (req, res) {

    //  Password -> directly storing -> db got hackend -> hackers will get id and password 
    //  token system -> there is right now no double check on users -> unauthorised access can happen

    // password -> hash -> crypting -> 

    // crypting means -> adding random words to your password using an algo -> salting

    // himanshu123ABC!@#123
    // algorithm 

    // salt -> Random Words

    // Salting -> Adding Random salt to your passswords 

    // Deciding salt and way to add salting depends on algo 

    // After doping salting

    //  hash -> converting your salted password -> fully random words 

    // himanshu123 + ABC123 => Hashing => 123@123ABCDEF@@!@#@$2EDCFRWESADAF

    // ->  db we will stored hashed password -> actual converted to hashed password


    // earlier -> himanshu123
    // -> 123@123ABCDEF@@!@#@$2EDCFRWESADAF

    //  salt


    const newUser = req.body

    let salt = await bcrypt.genSalt(10)

    let hashedPassword = await bcrypt.hash(newUser.password, salt)

    newUser.password = hashedPassword

    await userModel.create(newUser)  // a call to mongodb now tht use this model linked schema linnked table and use this data and add in it in db simple
    res.send("Create User is ready")
}

exports.loginAccount = async function (req, res) {
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
}


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


        jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY , function(err , decode){
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