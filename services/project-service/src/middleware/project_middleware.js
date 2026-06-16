const checkMemberShip = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const { projectId } = req.params;

    try {

    } catch (error) {
        console.error(`[project-service] error `, error);
        return response(res, 500, "intenal server error at project-service");
    }
}
export {
    checkMemberShip
}