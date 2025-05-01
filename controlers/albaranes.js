const albaranModel = require('../models/albaranes.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const crearAlbaran = async (req, res) => {

    try {
        const {userId, clientId, projectId, format, workdate, company, hours, quantity, descriptionId, multi, materials, concepts} = matchedData(req);
        const nuevoAlbaran = await albaranModel.create({
            userId,
            clientId,
            projectId,
            format,
            workdate,
            company,
            hours,
            quantity,
            descriptionId,
            multi,
            materials,
            concepts
        });
        await nuevoAlbaran.save();
        res.status(201).json({message: "Albaran creado", albaran: nuevoAlbaran });
    } catch (error) {
        handleHttpError(res, "ERROR_CREATE_ALBARAN", 500);
    }

}

module.exports = {crearAlbaran}