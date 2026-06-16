const response = (res, statusCode, message, data = null) => {
    if (!res) {
        console.error("Response Object is Null")
    }
    const responseObject = {
        success: statusCode < 400,
        message: message,
        data: data
    }
    return res.status(statusCode).json(responseObject);
}
export default response;