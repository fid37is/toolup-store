/* eslint-disable @typescript-eslint/no-unused-vars */
// utils/auth.js
import jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Promise<object>} - The decoded token payload
 */
export const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

/**
 * Generates a JWT token for a user
 * @param {object} user - The user object
 * @returns {string} - The generated JWT token
 */
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Middleware to protect API routes
 * @param {function} handler - The API route handler
 * @returns {function} - The protected API route handler
 */
export const withAuth = (handler) => {
    return async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = await verifyToken(token);

            // Add the user to the request object
            req.user = decoded;

            // Call the original handler
            return handler(req, res);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
};