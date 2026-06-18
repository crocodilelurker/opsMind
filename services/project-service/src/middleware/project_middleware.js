import response from "../utils/responseHandler.js";
import { query } from "../config/db.js";

const checkMemberShip = async (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const { projectId } = req.params;
    try {
        const result = await query(
            "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2",
            [projectId, userId]
        );
        if (result.rows.length === 0) {
            return response(res, 403, "You are not a member of this project", null);
        }
        next();
    } catch (error) {
        console.error("[project-service] checkMemberShip error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

const checkProjectOwner = async (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const { projectId } = req.params;

    if (!userId) {
        return response(res, 401, "Unauthorized: missing user identity", null);
    }

    try {
        const result = await query(
            "SELECT * FROM projects WHERE id = $1",
            [projectId]
        );
        if (result.rows.length === 0) {
            return response(res, 404, "Project not found", null);
        }

        const project = result.rows[0];

        if (String(project.owner_id) !== String(userId)) {
            return response(res, 403, "Only the project owner can perform this action", null);
        }
        req.project = project;
        next();
    } catch (error) {
        console.error("[project-service] checkProjectOwner error:", error);
        return response(res, 500, "Internal server error at project-service");
    }
};

export { checkMemberShip, checkProjectOwner };