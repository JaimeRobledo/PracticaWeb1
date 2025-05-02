const express = require('express');
const {crearAlbaran, getAlbaranes, getAlbaran, getPdfAlbaran, firmarAlbaran, borrarAlbaran} = require('../controlers/albaranes.js');
const {validatorCrearAlbaran, validatorUpdateAlbaran} = require('../validators/validatorAlbaranes.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const { uploadMiddlewareMemory} = require("../utils/handleStorage.js")
const albaranRouter = express.Router();


albaranRouter.use(express.json());

albaranRouter.post('/crearAlbaran', authMiddleware,validatorCrearAlbaran ,crearAlbaran);
albaranRouter.get('/getAlbaranes', authMiddleware, getAlbaranes);
albaranRouter.get('/getAlbaran/:id', authMiddleware, getAlbaran);
albaranRouter.get('/getPdfAlbaran/:id', authMiddleware, getPdfAlbaran);
albaranRouter.post('/firmarAlbaran/:id', authMiddleware, uploadMiddlewareMemory.single("image"), firmarAlbaran);
albaranRouter.delete('/borrarAlbaran/:id', authMiddleware, borrarAlbaran);

module.exports = albaranRouter;