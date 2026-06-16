import { Router } from "express";
import { createProject, getProject, getAllProjectsByUserId } from "../controllers/project_controller.js";
import { checkMemberShip } from "../middleware/project_middleware.js";
const router = Router();

router.get("/health", (req, res) => {
    return res.status(200).json({
        service: "project-service",
        status: "ok"
    })
})

router.post("/create", createProject);
router.get("/all", getAllProjectsByUserId);
router.get("/:projectId", checkMemberShip, getProject);


export default {
    router
}