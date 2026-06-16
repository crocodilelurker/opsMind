import { Router } from "express";
import { createProject } from "../controllers/project_controller.js";
const router = Router();

router.get("/health", (req, res) => {
    return res.status(200).json({
        service: "project-service",
        status: "ok"
    })
})

router.post("/create", createProject);

export default {
    router
}