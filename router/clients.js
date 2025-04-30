const express = require('express');
const {crearCliente, updateClient, listarClients, encontrarClient, deleteClient, listarArchivados, recuperarCliente} = require('../controlers/clients.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const clientRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearCliente', validatorCrearCliente ,crearCliente);
clientRouter.put('/actualizarCliente/:id', validatorUpdateClient, updateClient);
clientRouter.get('/listarClientes',authMiddleware, listarClients);
clientRouter.get('/encontrarCliente/:id',authMiddleware, encontrarClient);
clientRouter.delete('/borrarCliente/:id',authMiddleware, deleteClient);
clientRouter.get('/listarArchivados',authMiddleware, listarArchivados);
clientRouter.patch('/recuperarCliente/:id',authMiddleware, recuperarCliente);


module.exports = clientRouter;