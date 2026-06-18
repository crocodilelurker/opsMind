import response from "../utils/responseHandler.js";
import { query } from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";

const createProject = async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.headers["x-user-id"];
    if (!ownerId)
        return response(res, 400, "userId missing — please login again", null);
    if (!name || !description)
        return response(res, 400, "All fields are required", null);

    try {
        const projectResult = await query(
            "INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *",
            [name, description, ownerId]
        );
        const newProject = projectResult.rows[0];
        await query(
            "INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)",
            [newProject.id, ownerId]
        );
        return response(res, 201, "Workspace created successfully", newProject);
    } catch (error) {
        console.error("[project-service] createProject error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const getProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const result = await query("SELECT * FROM projects WHERE id = $1", [projectId]);
        if (result.rows.length === 0)
            return response(res, 404, "Project not found", null);
        return response(res, 200, "Project fetched successfully", result.rows[0]);
    } catch (error) {
        console.error("[project-service] getProject error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const getAllProjectsByUserId = async (req, res) => {
    const userId = req.headers["x-user-id"];
    if (!userId)
        return response(res, 400, "userId missing — please login again", null);
    try {
        const result = await query(
            `SELECT DISTINCT p.* FROM projects p
             LEFT JOIN project_members pm ON pm.project_id = p.id
             WHERE p.owner_id = $1 OR pm.user_id = $1`,
            [userId]
        );
        if (result.rows.length === 0)
            return response(res, 404, "No projects found", null);
        return response(res, 200, "Projects fetched successfully", result.rows);
    } catch (error) {
        console.error("[project-service] getAllProjectsByUserId error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const attachLinks = async (req, res) => {
    try {
        const { path } = req.body;
        const { projectId } = req.params;
        if (!path || !projectId)
            return response(res, 400, "All fields are required", null);
        const result = await query(
            `INSERT INTO project_integrations (project_id, repository_path, created_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (project_id)
             DO UPDATE SET repository_path = EXCLUDED.repository_path, created_at = EXCLUDED.created_at
             RETURNING *`,
            [projectId, path, new Date()]
        );
        return response(res, 201, "Repository link attached successfully", result.rows[0]);
    } catch (error) {
        console.error("[project-service] attachLinks error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!name && !description)
        return response(res, 400, "Provide at least one field to update (name or description)", null);

    try {
        const fields = [];
        const values = [];
        let idx = 1;

        if (name) { fields.push(`name = $${idx++}`); values.push(name); }
        if (description) { fields.push(`description = $${idx++}`); values.push(description); }
        values.push(projectId);

        const result = await query(
            `UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
            values
        );
        return response(res, 200, "Project updated successfully", result.rows[0]);
    } catch (error) {
        console.error("[project-service] updateProject error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const docsResult = await query(
            "SELECT public_id FROM project_documents WHERE project_id = $1 AND public_id IS NOT NULL",
            [projectId]
        );

        if (docsResult.rows.length > 0) {
            await Promise.all(
                docsResult.rows.map((doc) =>
                    cloudinary.uploader.destroy(doc.public_id, { resource_type: "auto" })
                )
            );
        }

        await query("DELETE FROM projects WHERE id = $1", [projectId]);
        return response(res, 200, "Project deleted successfully", null);
    } catch (error) {
        console.error("[project-service] deleteProject error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const addMembers = async (req, res) => {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId)
        return response(res, 400, "userId of the member to add is required", null);

    try {
        // Prevent duplicate members
        const existing = await query(
            "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
            [projectId, userId]
        );
        if (existing.rows.length > 0)
            return response(res, 409, "User is already a member of this project", null);

        const result = await query(
            "INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) RETURNING *",
            [projectId, userId]
        );
        return response(res, 201, "Member added successfully", result.rows[0]);
    } catch (error) {
        console.error("[project-service] addMembers error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const removeMembers = async (req, res) => {
    const { projectId, memberId } = req.params;   // memberId = user_id to remove
    const requesterId = req.headers["x-user-id"];

    if (!requesterId)
        return response(res, 401, "Unauthorized: missing user identity", null);

    try {
        const projectResult = await query(
            "SELECT owner_id FROM projects WHERE id = $1",
            [projectId]
        );
        if (projectResult.rows.length === 0)
            return response(res, 404, "Project not found", null);

        const isOwner = String(projectResult.rows[0].owner_id) === String(requesterId);
        const isSelf  = String(requesterId) === String(memberId);
if (!isOwner && !isSelf) {
            return response(
                res, 403,
                "You are not authorized to remove this member. You can only remove yourself.",
                null
            );
        }
     if (isOwner && isSelf) {
            return response(
                res, 400,
                "The project owner cannot remove themselves. Transfer ownership or delete the project instead.",
                null
            );
        }

        const result = await query(
            "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *",
            [projectId, memberId]
        );
        if (result.rows.length === 0)
            return response(res, 404, "Member not found in this project", null);

        return response(res, 200, "Member removed successfully", null);
    } catch (error) {
        console.error("[project-service] removeMembers error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};
const addDoc = async (req, res) => {
    const { projectId } = req.params;

    if (!req.file)
        return response(res, 400, "No file uploaded. Send file under field name 'document'", null);

    try {
        const { originalname, path: secureUrl, filename: public_id } = req.file;

        const result = await query(
            `INSERT INTO project_documents (project_id, name, public_id, path)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [projectId, originalname, public_id, secureUrl]
        );
        return response(res, 201, "Document uploaded successfully", result.rows[0]);
    } catch (error) {
        console.error("[project-service] addDoc error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};
const deleteDoc = async (req, res) => {
    const { projectId, docId } = req.params;

    try {
        const docResult = await query(
            "SELECT * FROM project_documents WHERE id = $1 AND project_id = $2",
            [docId, projectId]
        );
        if (docResult.rows.length === 0)
            return response(res, 404, "Document not found", null);

        const doc = docResult.rows[0];
        if (doc.public_id) {
            await cloudinary.uploader.destroy(doc.public_id, { resource_type: "auto" });
        }

        await query("DELETE FROM project_documents WHERE id = $1", [docId]);
        return response(res, 200, "Document deleted successfully", null);
    } catch (error) {
        console.error("[project-service] deleteDoc error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};
const getDocs = async (req, res) => {
    const { projectId } = req.params;
    try {
        const result = await query(
            "SELECT id, name, path, created_at FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC",
            [projectId]
        );
        return response(res, 200, "Documents fetched successfully", result.rows);
    } catch (error) {
        console.error("[project-service] getDocs error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

export {
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
};