import { Router } from "express";
import {
    createProject,
    getProject,
    getAllProjectsByUserId,
    attachLinks,
    updateProject,
    deleteProject,
    addMembers,
    removeMembers,
    addDoc,
    deleteDoc,
    getDocs,
} from "../controllers/project_controller.js";
import { checkMemberShip, checkProjectOwner } from "../middleware/project_middleware.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.get("/health", (req, res) => {
    return res.status(200).json({ service: "project-service", status: "ok" });
});
router.post("/create", createProject);
router.get("/all", getAllProjectsByUserId);
router.get("/:projectId", checkMemberShip, getProject);

router.patch("/:projectId", checkProjectOwner, updateProject);

router.delete("/:projectId", checkProjectOwner, deleteProject);

router.post("/attach/:projectId", checkProjectOwner, attachLinks);

router.post("/:projectId/members", checkProjectOwner, addMembers);

router.delete("/:projectId/members/:memberId", checkMemberShip, removeMembers);

router.get("/:projectId/docs", checkMemberShip, getDocs);

router.post("/:projectId/docs", checkMemberShip, upload.single("document"), addDoc);

router.delete("/:projectId/docs/:docId", checkProjectOwner, deleteDoc);

export default { router };