/**
 * Authentication Service - JWT Token Generation
 * 
 * This service module handles the generation of JSON Web Tokens (JWT) for user authentication.
 * It provides two types of tokens:
 * 1. Access Token - Short-lived token for API authentication (typically 15 minutes)
 * 2. Refresh Token - Long-lived token for obtaining new access tokens (typically 7 days)
 * 
 * These tokens are used to securely authenticate users without storing session data on the server.
 */

// Import jsonwebtoken library - provides functions to create and verify JWT tokens
// JWT is a standard for securely transmitting information between parties as a JSON object
const jwt = require("jsonwebtoken")

/**
 * Generates a short-lived access token for user authentication.
 * 
 * Access tokens are used to authenticate API requests. They have a short expiration time
 * (typically 15 minutes) for security - if stolen, they expire quickly.
 * 
 * @param {Object} userData - The user data to encode in the token
 * @param {string} userData.userId - The unique identifier of the user
 * @param {string} userData.email - The user's email address
 * @returns {string} A signed JWT access token that can be used for authenticated requests
 * 
 * @example
 * const token = generateAccessToken({ userId: "123", email: "user@example.com" })
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
exports.generateAccessToken = function (userData){
    // Use jwt.sign() to create a signed token
    // Parameters:
    // 1. userData - The payload/data to encode in the token (userId, email, etc.)
    // 2. process.env.ACCESS_TOKEN_SECRET_KEY - Secret key used to sign the token (from environment variables)
    //    This secret ensures the token cannot be tampered with
    // 3. {expiresIn: ...} - Token expiration time (e.g., "15m" for 15 minutes)
    //    After expiration, the token becomes invalid and user must refresh it
    let accessToken = jwt.sign( 
        userData,                                    // Payload: data to encode in token
        process.env.ACCESS_TOKEN_SECRET_KEY,         // Secret key: used to sign/verify token
        {expiresIn : process.env.ACCESS_TOKEN_EXPIRE} // Options: expiration time from env (e.g., "15m")
    )

    // Return the generated token string
    // This token will be sent to the client and included in Authorization header for API requests
    return accessToken
}

/**
 * Generates a long-lived refresh token for obtaining new access tokens.
 * 
 * Refresh tokens are used to get new access tokens when they expire. They have a longer
 * expiration time (typically 7 days) and are stored in the database. When an access token
 * expires, the client can use the refresh token to get a new one without requiring the user
 * to log in again.
 * 
 * @param {Object} userData - The user data to encode in the token
 * @param {string} userData.userId - The unique identifier of the user
 * @returns {string} A signed JWT refresh token that can be used to obtain new access tokens
 * 
 * @example
 * const refreshToken = generateRefreshToken({ userId: "123" })
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * 
 * @note Refresh tokens are typically stored in the database and checked on each refresh request
 *       to ensure they haven't been revoked (e.g., on logout)
 */
exports.generateRefreshToken = function(userData){
    // Use jwt.sign() to create a signed refresh token
    // Parameters:
    // 1. userData - The payload/data to encode (typically just userId for refresh tokens)
    // 2. process.env.REFRESH_TOKEN_SECRET_KEY - Different secret key for refresh tokens
    //    Using a different secret adds an extra layer of security
    // 3. {expiresIn: ...} - Longer expiration time (e.g., "7d" for 7 days)
    //    This allows users to stay logged in for extended periods
    let refreshToken = jwt.sign(
        userData,                                      // Payload: typically just userId
        process.env.REFRESH_TOKEN_SECRET_KEY,          // Secret key: different from access token secret
        {expiresIn : process.env.REFRESH_TOKEN_EXPIRE} // Options: longer expiration (e.g., "7d")
    )

    // Return the generated refresh token string
    // This token will be stored in the database and used to generate new access tokens
    return refreshToken
}