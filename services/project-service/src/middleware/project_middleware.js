import response from "../utils/responseHandler.js";
import { query } from "../config/db.js";
const checkMemberShip = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const { projectId } = req.params;
    try {
        const result = await query(
            'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
            [projectId, userId]
        );
        if (result.rows.length === 0) {
            return response(res, 403, "You are not a member of this project", null);
        }
        next();
    } catch (error) {
        console.error(`[project-service] error `, error);
        return response(res, 500, "intenal server error at project-service");
    }
}
export {
    checkMemberShip
}