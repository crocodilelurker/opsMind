//create project 
//get project
//update project
//delete project
//attach links github repo
//add members
//delete members
//add docs 
//delete docs

import response from "../utils/responseHandler.js";
import { query } from "../config/db.js";

const createProject = async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.headers["x-user-id"];
    if (!ownerId)
        return response(res, 400, "userId missing login again", null);
    if (!name || !description || !ownerId) {
        return response(res, 400, "all fields are required", null);
    } try {
        const projectResult = await query(
            'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [name, description, ownerId]
        );
        const newProject = projectResult.rows[0];
        await query(
            'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
            [newProject.id, ownerId]
        );
        return response(res, 201, "Workspace created successfully", newProject);
    } catch (error) {
        console.error(`[project-service] error `, error);
        return response(res, 500, "intenal server error at project-service");
    }
}

export {
    createProject
}