import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware"
import dotenv from "dotenv";
import { authenticateRequest } from "./dependencyFunctions.js";
dotenv.config();
const app = express();
const KNOWLEDGE_SERVICE_URL = process.env.KNOWLEDGE_SERVICE_URL || "http://knowledge-service:8000";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:8000";
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || "http://project-service:8000";
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
app.use("/api/knowledge", createProxyMiddleware({ // removed authenticateRequest for testing
    target: KNOWLEDGE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/api/knowledge": ""
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            if (req.user) {
                proxyReq.setHeader("x-user-id", String(req.user.id));
            }
        },
        onError: (err, req, res) => {
            console.log(`[gateway error:] connection failed to knowledge Service ${err.message}`)
            res.status(503).json({ error: "Gateway Error, Knowledge Service down" })
        }
    }
}))
app.use("/api/projects", authenticateRequest, createProxyMiddleware({
    target: PROJECT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        "^/api/projects": "",
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            if (req.user) {
                proxyReq.setHeader("x-user-id", String(req.user.id));
            }
        }
    },
    onError: (err, req, res) => {
        console.log(`[gateway error:] connection failed to Project Service ${err.message}`)
        res.status(503).json({ error: "Gateway Error, Project Service down" })
    }
}))
app.use('/api/agents', authenticateRequest, createProxyMiddleware({
    target: process.env.AGENT_SERVICE_URL || 'http://agent-service:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/agents': '',
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            if (req.user) {
                proxyReq.setHeader('X-User-Id', String(req.user.id));
            }
        }
    },
    onError: (err, req, res) => {
        console.error(`[Proxy Error] Connection to Agent Service failed: ${err.message}`);
        res.status(503).json({ error: 'AI Orchestration Engine down.' });
    }
}));
app.use((req, res) => {
    res.status(404).json({ error: `Route path '${req.originalUrl}' matches no gateway routing matrix rule.` });
});
const PORT = process.env.PORT || 8000;
app.get("/health", (req, res) => {
    res.status(200).json({
        "health": "good"
    })
})
app.listen(PORT, () => {
    console.log("API Gateway running on port 8000");
})