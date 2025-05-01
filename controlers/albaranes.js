const albaranModel = require('../models/albaranes.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const crearAlbaran = async (req, res) => {

    try {
        const body = matchedData(req)
        body.userId = req.user._id;
        const newAlbaran = await albaranModel.create(body)
        res.status(201).send({data: newAlbaran})
    } catch (e) {
        handleHttpError(res, "ERROR_ALBARAN_CREATE", 500)
    }
}

module.exports = {crearAlbaran}