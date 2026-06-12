import response from "../utils/responseHandler.js"

const register = async (req, res) => {
    return response(res, 200, "working fine", null);
}

const login = async (req, res) => {
    return response(res, 200, "working fine", null);
}

export {
    register,
    login
}