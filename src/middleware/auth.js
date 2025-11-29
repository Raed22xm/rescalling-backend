/**
 * Authentication Middleware - JWT Token Verification
 * 
 * This middleware function verifies JWT access tokens on protected API routes.
 * It extracts the token from the Authorization header, verifies its validity,
 * and attaches the decoded user data to the request object.
 * 
 * This middleware is used to protect routes that require user authentication,
 * such as image resizing, viewing dashboard, etc.
 */

// Import jsonwebtoken library - provides functions to verify JWT tokens
// Used to decode and verify the signature of tokens sent by clients
const jwt = require("jsonwebtoken")

/**
 * Middleware function to verify JWT access tokens in incoming requests.
 * 
 * This function:
 * 1. Extracts the token from the Authorization header
 * 2. Verifies the token signature and expiration
 * 3. Attaches decoded user data to req.user
 * 4. Calls next() to continue to the route handler, or returns error if invalid
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header containing "Bearer <token>"
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Either calls next() to continue or sends error response
 * 
 * @example
 * // Usage in routes:
 * router.post("/resizeImg", jwtverifyAccessToken, resizeImage)
 * // The token must be sent as: Authorization: Bearer <access_token>
 */
exports.jwtverifyAccessToken = function(req, res, next) {
    /**
     * Extract the Authorization header from the request.
     * The header format should be: "Bearer <token>"
     * If no authorization header is present, default to empty string
     */
    const authHeader = req.headers.authorization || ""
    
    /**
     * Extract the actual token from the Authorization header.
     * Format: "Bearer <token>" -> we need just the token part
     * 
     * Steps:
     * 1. Check if header starts with "Bearer " prefix
     * 2. Split by space to separate "Bearer" from the token
     * 3. Get the second part (index 1) which is the actual token
     * 
     * If header doesn't start with "Bearer", this will be false/undefined
     */
    const token = authHeader.startsWith("Bearer") && authHeader.split(" ")[1];
    
    /**
     * Validate that a token was successfully extracted.
     * If no token is present, the request is unauthorized.
     * Return 401 Unauthorized status with error message.
     */
    if (!token) {
        // Return early with error response - don't proceed to route handler
        return res.status(401).json({ message: "Token is missing !!" })
    }
    
    /**
     * Try to verify the token using jwt.verify()
     * This will:
     * 1. Check the token signature matches the secret key
     * 2. Verify the token hasn't expired
     * 3. Decode the payload (user data) from the token
     */
    try {
        /**
         * Verify and decode the JWT token.
         * Parameters:
         * 1. token - The JWT token string to verify
         * 2. process.env.ACCESS_TOKEN_SECRET_KEY - The secret key used to sign the token
         * 
         * Returns: Decoded payload (user data) that was encoded in the token
         * Example: { userId: "123", email: "user@example.com", iat: 1234567890, exp: 1234568790 }
         */
        req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY)
        
        /**
         * If verification succeeds, attach decoded user data to request object.
         * This allows route handlers to access user information via req.user
         * 
         * Call next() to pass control to the next middleware or route handler.
         * The request is now authenticated and can proceed.
         */
        next()
    } catch {
        /**
         * If token verification fails, catch the error.
         * This happens when:
         * - Token signature doesn't match (tampered token)
         * - Token has expired
         * - Token format is invalid
         * - Secret key doesn't match
         * 
         * Return 401 Unauthorized status with error message.
         * Don't call next() - stop the request here.
         */
        return res.status(401).json({ message: "AccessToken Invalid" })
    }

}
