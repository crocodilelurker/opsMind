import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const authenticateRequest = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Authentication failed. Access token missing or malformed.'
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.userId
        };
        next();
    } catch (err) {
        return res.status(403).json({
            error: 'Authentication failed. Token is invalid or expired.'
        });
    }
};

export {
    authenticateRequest
}