const express = require('express');
const {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto} = require('../controlers/projects.js');
const {validatorCrearProyecto, validatorUpdateProyecto} = require('../validators/validatorProjects.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const projectRouter = express.Router();


projectRouter.use(express.json());

projectRouter.post('/crearProyecto',authMiddleware, validatorCrearProyecto ,crearProyecto);
projectRouter.put('/actualizarProyecto/:id',authMiddleware, validatorUpdateProyecto, updateProyecto);
projectRouter.get('/listarProyectos',authMiddleware, listarProyectos);
projectRouter.get('/encontrarProyecto/:id',authMiddleware, encontrarProyecto);
projectRouter.delete('/borrarProyecto/:id',authMiddleware, deleteProyecto);
projectRouter.get('/listarArchivados',authMiddleware, listarArchivados);
projectRouter.patch('/recuperarProyecto/:id',authMiddleware, recuperarProyecto);


module.exports = projectRouter;