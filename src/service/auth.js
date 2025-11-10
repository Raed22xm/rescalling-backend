const jwt = require("jsonwebtoken")

exports.generateAccessToken = function (userData){
    let accessToken = jwt.sign( userData , process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn : process.env.ACCESS_TOKEN_EXPIRE} )

    return accessToken
}

exports.generateRefreshToken = function(userData){
    let refreshToken = jwt.sign(userData , process.env.REFRESH_TOKEN_SECRET_KEY , {expiresIn : process.env.REFRESH_TOKEN_EXPIRE})

    return refreshToken
}