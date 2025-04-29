const express = require('express');
const {crearCliente} = require('../controlers/clients.js');
const {validatorCrearCliente} = require('../validators/validatorClients.js');
const clientRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearCliente', validatorCrearCliente ,crearCliente);


module.exports = clientRouter;