import express from "express";
import dotenv from "dotenv";
import router from "./routes/project_routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use("/", router.router);
app.listen(PORT, () => {
    console.log(`[project-service] running on port ${PORT}`);
});
