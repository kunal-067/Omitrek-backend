require('dotenv').config();
const jwt = require('jsonwebtoken');
const Shop = require('../Models/shop.model');
const secret = process.env.JWT_TOKEN || 'T7&3#r45%21E945$8#@90k3#9!1O890MI';
const expiresIn = parseInt(process.env.JWT_EXPIRY)*24*60*60 || 30*24*60*60;


/**
 * Generate signed JWT token
 * @param {object} user 
 * @returns {string} - Signed JWT token
 */
const generateToken = (data) => {
    try {
        if (!secret) throw new Error("JWT secret not found");

        const expiresAt = Date.now() + expiresIn;
        const token = jwt.sign(data, secret, {
            expiresIn
        });

        return {token, expiresAt};
    } catch (error) {
        console.log("generate token failed:", error);
        throw new Error(error.message);
    }
};

async function verifyToken(token) {
    const data = await jwt.verify(token, secret)
    return data;
}



module.exports = {
    generateToken,
    verifyToken
}