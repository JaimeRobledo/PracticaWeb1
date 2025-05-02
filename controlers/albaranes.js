const albaranModel = require('../models/albaranes.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const crearAlbaran = async (req, res) => {

    try {
        const body = matchedData(req)
        body.userId = req.user._id;
        const existeAlbaran = await albaranModel.findOne({
            userId: body.userId,
            clientId: body.clientId,
            projectId: body.projectId,
            workdate: body.workdate
        });
    
        if (existeAlbaran) {
            return res.status(409).json({ error: "Albarán ya existente para este usuario, cliente, proyecto y fecha." });
        }

        const newAlbaran = await albaranModel.create(body)
        res.status(201).send({data: newAlbaran})
    } catch (e) {
        handleHttpError(res, "ERROR_ALBARAN_CREATE", 500)
    }
}

const getAlbaranes = async (req, res) => {
    try {
        const body = matchedData(req)
        body.userId = req.user._id;
        const userId = body.userId;
        const projectId = req.query.projectId;

        if(projectId) {
            const albaranes = await albaranModel.find({ userId, projectId })
            return res.status(200).send({data: albaranes})

        }else {
            const albaranes = await albaranModel.find({ userId })
            return res.status(200).send({data: albaranes})
        }
    } catch (e) {
        handleHttpError(res, "ERROR_ALBARAN_GET", 500)
    }
}

const getAlbaran = async (req, res) => {
    try {
        const { id } = req.params
        console.log("ID del albarán:", id)

        const albaran = await albaranModel.findById(id).populate('clientId').populate('projectId').populate('userId');

        console.log("Albarán encontrado:", albaran);

    if (!albaran) {
        return res.status(404).json({ error: "Albarán no encontrado" });
    }

    return res.status(200).send({ data: albaran });

  } catch (e) {
        console.error("Error interno:", e);
        handleHttpError(res, "ERROR_ALBARAN_GET", 500);
  }
}

const getPdfAlbaran = async (req, res) => {

}

module.exports = {crearAlbaran, getAlbaranes, getAlbaran, getPdfAlbaran}