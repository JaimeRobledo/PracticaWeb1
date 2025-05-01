const express = require('express');
const {crearAlbaran} = require('../controlers/albaranes.js');
const {validatorCrearAlbaran, validatorUpdateAlbaran} = require('../validators/validatorAlbaranes.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const albaranRouter = express.Router();


albaranRouter.use(express.json());

albaranRouter.post('/crearAlbaran', authMiddleware,validatorCrearAlbaran ,crearAlbaran);




module.exports = albaranRouter;