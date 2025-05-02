const express = require('express');
const {crearAlbaran, getAlbaranes, getAlbaran} = require('../controlers/albaranes.js');
const {validatorCrearAlbaran, validatorUpdateAlbaran} = require('../validators/validatorAlbaranes.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const albaranRouter = express.Router();


albaranRouter.use(express.json());

albaranRouter.post('/crearAlbaran', authMiddleware,validatorCrearAlbaran ,crearAlbaran);
albaranRouter.get('/getAlbaranes', authMiddleware, getAlbaranes);
albaranRouter.get('/getAlbaran/:id', authMiddleware, getAlbaran);




module.exports = albaranRouter;