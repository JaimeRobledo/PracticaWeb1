const express = require('express');
const {crearAlbaran} = require('../controlers/albaranes.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const albaranRouter = express.Router();


albaranRouter.use(express.json());

albaranRouter.post('/crearAlbaran', authMiddleware,validatorCrearCliente ,crearAlbaran);




module.exports = albaranRouter;