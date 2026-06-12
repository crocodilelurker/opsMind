import express from "express";
import dotenv from "dotenv";
const app = express();
dotenv.config();
app.use(express.json());

app.get("/health", (req, res) => {
    console.log("[auth-service] health checked")
    res.status(200).json({ message: "Auth Service Is Running" })
})
const PORT = process.env.PORT || 8001

app.listen(PORT, () => {
    console.log(`[auth-service] Auth Service Started on Port : ${PORT}`)
})