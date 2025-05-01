const express = require('express');
const {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto} = require('../controlers/projects.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const projectRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearProyecto', validatorCrearCliente ,crearProyecto);
clientRouter.put('/actualizarProyecto/:id', validatorUpdateClient, updateProyecto);
clientRouter.get('/listarProyectos',authMiddleware, listarProyectos);
clientRouter.get('/encontrarProyecto/:id',authMiddleware, encontrarProyecto);
clientRouter.delete('/borrarProyecto/:id',authMiddleware, deleteProyecto);
clientRouter.get('/listarArchivados',authMiddleware, listarArchivados);
clientRouter.patch('/recuperarProyecto/:id',authMiddleware, recuperarProyecto);


module.exports = clientRouter;