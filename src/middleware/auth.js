const jwt = require("jsonwebtoken")

exports.jwtverifyAccessToken = function(req, res, next) {
    // token in header with prefix of bearer
    const authHeader = req.headers.authorization || ""
    const token = authHeader.startsWith("Bearer") && authHeader.split(" ")[1];
console.log(token)
    if (!token) {
        return res.status(401).json({ message: "Token is missing !!" })
    }
console.log(process.env.ACCESS_TOKEN_SECRET)
    try {
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY)
        next()
    } catch (err) {
        return res.status(401).json({ message: "AccessToken Invalid" })
    }

}