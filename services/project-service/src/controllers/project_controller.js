//create project 
//get project
//get all projects 
//done till here 

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
const getProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const result = await query(
            'SELECT * FROM projects WHERE id = $1',
            [projectId]
        );
        if (result.rows.length === 0) {
            return response(res, 404, "Project not found", null);
        }
        return response(res, 200, "Project fetched successfully", result.rows[0]);
    } catch (error) {
        console.error(`[project-service] error `, error);
        return response(res, 500, "intenal server error at project-service");
    }
}
const getAllProjectsByUserId = async (req, res) => {
    const userId = req.headers["x-user-id"];
    if (!userId)
        return response(res, 400, "userId missing login again", null);
    try {
        const result = await query(
            'SELECT * FROM projects WHERE owner_id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return response(res, 404, "Projects not found", null);
        }
        return response(res, 200, "Projects fetched successfully", result.rows);
    } catch (error) {
        console.error(`[project-service] error `, error);
        return response(res, 500, "intenal server error at project-service");
    }
}
export {
    createProject,
    getProject,
    getAllProjectsByUserId
}