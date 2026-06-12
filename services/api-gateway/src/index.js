import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware"
import dotenv from "dotenv";

dotenv.config();
const app = express();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:8000";

app.use((req, res, next) => {
    console.log(`[gateway intercept] ${req.method} request recieved for ${req.url}`)
    next();
})//global middleware logging

app.use("/api/auth", createProxyMiddleware(
    {
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            "/api/auth": ""
        },
        onError: (err, req, res) => {
            console.log(`[gateway error:] connection failed to Auth Service ${err.message} `)
            res.status(503).json({ error: "Gateway Error, Auth Service down" })
        }
    }
));
const PORT = process.env.PORT || 8000;
app.get("/health", (req, res) => {
    res.status(200).json({
        "health": "good"
    })
})
app.listen(PORT, () => {
    console.log("API Gateway running on port 8000");
})