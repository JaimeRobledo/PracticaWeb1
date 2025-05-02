const albaranModel = require('../models/albaranes.js')
const pdfDocument = require('pdfkit');
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');
const { uploadToPinata } = require( '../utils/handleUploadIPFS.js')
const fetch = require('node-fetch');

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

    const albaran = await albaranModel.findById(id).populate('clientId').populate('projectId').populate('userId');

    if(albaran){
            
            res.setHeader('Content-Disposition', `attachment; filename=albaran_${id}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');

            //generar pdf
            const nuevoPdf = new pdfDocument();
            const buffers = [];
        
            nuevoPdf.on('data', buffer => buffers.push(buffer));

            nuevoPdf.pipe(res); // enviar directamente como respuesta

            nuevoPdf.fontSize(20).text(`Albarán Nº ${albaran._id}`, { align: 'center' });
            nuevoPdf.moveDown();

            // Datos usuario
            nuevoPdf.fontSize(12).text(`Usuario: ${albaran.userId.nombre +' '+ albaran.userId.apellidos || 'Sin nombre'}`);
            nuevoPdf.text(`Email: ${albaran.userId.email || 'Sin email'}`);
            nuevoPdf.moveDown();

            // Datos cliente
            nuevoPdf.text(`Cliente: ${albaran.clientId.nombre || 'N/A'}`);
            nuevoPdf.text(`Proyecto: ${albaran.projectId.nombre || 'N/A'}`);
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

            if (albaran.signed === true && albaran.sign) {
                nuevoPdf.text('Firma adjunta:');
                //sin axios
                const response = await fetch(albaran.sign);
                const buffer = await response.buffer();
                nuevoPdf.image(buffer, { width: 150 }).moveDown();

            }
            
            nuevoPdf.on('end', async () => {
                const pdfBuffer = Buffer.concat(buffers);
                
                try {
                    const uploaded = await uploadToPinata(pdfBuffer, `albaran_${albaran._id}.pdf`);
                    const pdfUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${uploaded.IpfsHash}`;
                    
                    albaran.pdf = pdfUrl;
                    await albaran.save();
                    
                    console.log("PDF uploaded to Pinata successfully:", pdfUrl);

                } catch (error) {
                    console.error("Error uploading to Pinata:", error);
                }
            });
            nuevoPdf.end();

        

    }else{
        return res.status(404).json({ error: "Albarán no encontrado" });
    }

}

const firmarAlbaran = async (req, res) => {

    try {
        const { id } = req.params

        const albaran = await albaranModel.findById(id)

        if(albaran){
            const fileBuffer = req.file.buffer
            const fileName = req.file.originalname
            const pinataResponse = await uploadToPinata(fileBuffer, fileName)
            const ipfsFile = pinataResponse.IpfsHash
            const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`
            const data = await albaranModel.findByIdAndUpdate(id, { sign: ipfs }, { new: true });
            
            albaran.signed = true;
            await albaran.save();
            return res.status(200).send({data: "Albarán firmado correctamente: ", data});
        }else{
            return res.status(404).json({ error: "Albarán no encontrado" });
        }
        
    }catch(err) {
        console.log(err)
        res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE")
        //handleHttpError(res, "ERROR_UPLOAD_COMPANY_IMAGE")
    }
}

const borrarAlbaran = async (req, res) => {
    try {
        const { id } = req.params
        console.log("ID del albarán:", id)

        const albaran = await albaranModel.findById(id)
        const softDelete = req.query.soft !== "false"
        console.log("ID del albarán:", id)
        console.log("albaran:", albaran)

        if(albaran && albaran.signed === false){
            if (softDelete) {
        
                await albaran.delete(); // método de mongoose-delete
                return res.status(200).json({ message: "Albaran desactivado correctamente" });
            }
        
            const result = await albaranModel.deleteOne({id});
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "Albaran no encontrado o no autorizado para hard delete" });
            }
            return res.status(200).json({ message: "Proyecto eliminado correctamente" });

        }if(albaran && albaran.signed === true){
            return res.status(404).json({ error: "Albarán esta firmado y no se puede borrar" });
        }else{
            return res.status(404).json({ error: "Albarán no encontrado" });
        }
        
    }catch(err) {
        console.log(err)
        res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE")
        //handleHttpError(res, "ERROR_UPLOAD_COMPANY_IMAGE")
    }
}

module.exports = {crearAlbaran, getAlbaranes, getAlbaran, getPdfAlbaran, firmarAlbaran, borrarAlbaran}