const express = require('express');
const {crearCliente, updateClient, listarClients, encontrarClient, deleteClient} = require('../controlers/clients.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const clientRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearCliente', validatorCrearCliente ,crearCliente);
clientRouter.put('/actualizarCliente/:id', validatorUpdateClient, updateClient);
clientRouter.get('/listarClientes', listarClients);
clientRouter.get('/encontrarCliente/:id', encontrarClient);
clientRouter.delete('/borrarCliente/:id', deleteClient);


module.exports = clientRouter;