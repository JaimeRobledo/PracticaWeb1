const express = require('express');
const {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto} = require('../controlers/projects.js');
const {validatorCrearProyecto, validatorUpdateProyecto} = require('../validators/validatorProjects.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const projectRouter = express.Router();


clientRouter.use(express.json());

clientRouter.post('/crearProyecto', validatorCrearProyecto ,crearProyecto);
clientRouter.put('/actualizarProyecto/:id', validatorUpdateProyecto, updateProyecto);
clientRouter.get('/listarProyectos',authMiddleware, listarProyectos);
clientRouter.get('/encontrarProyecto/:id',authMiddleware, encontrarProyecto);
clientRouter.delete('/borrarProyecto/:id',authMiddleware, deleteProyecto);
clientRouter.get('/listarArchivados',authMiddleware, listarArchivados);
clientRouter.patch('/recuperarProyecto/:id',authMiddleware, recuperarProyecto);


module.exports = projectRouter;