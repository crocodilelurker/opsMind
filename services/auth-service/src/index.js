import express from "express";
import dotenv from "dotenv";
import { router as authRouter } from "./router/authRouter.js";
import response from "./utils/responseHandler.js";
const app = express();
dotenv.config();
app.use(express.json());


app.use("/", authRouter);
app.get("/health", (req, res) => {
    console.log("[auth-service] health checked")
    return response(res, 200, "health is wealth", { status: "running" });
})
const PORT = process.env.PORT || 8001

app.listen(PORT, () => {
    console.log(`[auth-service] Auth Service Started on Port : ${PORT}`)
})