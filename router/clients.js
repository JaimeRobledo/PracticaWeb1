const express = require('express');
const {crearCliente, updateClient, listarClientes} = require('../controlers/clients.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const clientRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearCliente', validatorCrearCliente ,crearCliente);
clientRouter.put('/actualizarCliente/:id', validatorUpdateClient, updateClient);
clientRouter.get('/listarClientes', listarClientes);


module.exports = clientRouter;