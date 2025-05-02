const albaranModel = require('../models/albaranes.js')
const pdfDocument = require('pdfkit');
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
    const { id } = req.params
    console.log("ID del albarán:", id)
    const body = matchedData(req)
    body.userId = req.user._id;
    const userId = body.userId;

    const albaran = await albaranModel.findById(id, userId).populate('clientId').populate('projectId').populate('userId');

    if(albaran){

        if(albaran.signed && albaran.pdf != null){
            return res.status(200).send({data: albaran.pdf});
        }else{
            //generar pdf
            const nuevoPdf = new pdfDocument();
            res.setHeader('Content-Disposition', 'attachment; filename=albaran.pdf');
            res.setHeader('Content-Type', 'application/pdf');

            nuevoPdf.pipe(res); // enviar directamente como respuesta

            nuevoPdf.fontSize(20).text(`Albarán Nº ${albaran._id}`, { align: 'center' });
            nuevoPdf.moveDown();

            // Datos usuario
            nuevoPdf.fontSize(12).text(`Usuario: ${albaran.userId.name || 'Sin nombre'}`);
            nuevoPdf.text(`Email: ${albaran.userId.email || 'Sin email'}`);
            nuevoPdf.moveDown();

            // Datos cliente
            nuevoPdf.text(`Cliente: ${albaran.clientId.name || 'N/A'}`);
            nuevoPdf.text(`Proyecto: ${albaran.projectId.name || 'N/A'}`);
            nuevoPdf.moveDown();

            // Detalles del albarán
            nuevoPdf.text(`Fecha de trabajo: ${new Date(albaran.workdate).toLocaleDateString()}`);
            nuevoPdf.text(`Formato: ${albaran.format}`);
            if (albaran.format === 'hours') {
                nuevoPdf.text(`Horas: ${albaran.hours}`);
            } else if (albaran.format === 'material') {
                nuevoPdf.text(`Cantidad: ${albaran.quantity}`);
            }
            nuevoPdf.text(`Descripción: ${albaran.description || 'N/A'}`);
            nuevoPdf.moveDown();

            // Firma (si existe)
            if (albaran.sign) {
                nuevoPdf.text('Firma adjunta:');
                nuevoPdf.image(albaran.sign, { width: 150 }).moveDown();
            }

            nuevoPdf.end();
        }

    }else{
        return res.status(404).json({ error: "Albarán no encontrado" });
    }

}

module.exports = {crearAlbaran, getAlbaranes, getAlbaran, getPdfAlbaran}