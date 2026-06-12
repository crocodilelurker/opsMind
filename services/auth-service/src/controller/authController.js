import { query } from "../db.js";
import response from "../utils/responseHandler.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const register = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return response(res, 400, "All fields are required", null);
    }
    try {
        const userExists = await query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return response(res, 409, "user already exists", null);
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await query(
            `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id,email,name`
            , [email, hashedPassword, name]
        );
        return response(res, 201, "user registered succesfully", newUser.rows[0]);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal Server Error", null);
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET_KEY;
    if (!email || !password) {
        return response(res, 400, "Missing credentials payload.", null);
    }
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return response(res, 401, "Authentication failed. Invalid email or password.");
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response(res, 401, "Authentication failed. Invalid email or password.");
        }
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        return response(res, 200, "Authentication verified successfully.", {
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (err) {
        console.error('[auth-service] Login routine failed:', err.message);
        return response(res, 500, "Internal authentication validation failure.");
    }
}
export {
    register,
    login
}