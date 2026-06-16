import express from "express";
import dotenv from "dotenv";
import response from "./utils/responseHandler.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
    console.log(`[project-service] home route accessed ${req.headers["x-user-id"]}`);
    return response(res, 200, "hello world from service", null);

});

app.listen(PORT, () => {
    console.log(`[project-service] running on port ${PORT}`);
});

