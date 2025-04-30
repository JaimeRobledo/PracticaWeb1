const { handleHttpError } = require("../utils/handleError.js")
const { verifyToken } = require("../utils/encargarseJwt")
const userModel = require("../models/users.js")

const authMiddleware = async (req, res, next) => {
    try{
        if (!req.headers.authorization) {
            handleHttpError(res, "NOT_TOKEN", 401)
            return
        }
        // Nos llega la palabra reservada Bearer (es un estándar) y el Token, así que me quedo con la última parte
        const token = req.headers.authorization.split(' ').pop()
        //Del token, miramos en Payload (revisar verifyToken de utils/handleJwt)
        const dataToken = await verifyToken(token)
        if(!dataToken._id) {
            handleHttpError(res, "ERROR_ID_TOKEN", 401)
            return
        }
        const user = await userModel.findById(dataToken._id)
        if(!user){
            handleHttpError(res, "USER_NOT_FOUND", 404)
            return
        }
        req.user = user
        next()
    }catch(err){
        handleHttpError(res, "NOT_SESSION", 401)
    }
}
module.exports = {authMiddleware}