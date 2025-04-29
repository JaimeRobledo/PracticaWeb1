const express = require('express');
const {crearCliente} = require('../controlers/clients.js');
const {validatorCrearCliente} = require('../validators/validatorClients.js');

const clientRouter = express.Router();


userRouter.use(express.json());




module.exports = clientRouter;