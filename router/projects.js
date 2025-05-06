const express = require('express');
const {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto} = require('../controlers/projects.js');
const {validatorCrearProyecto, validatorUpdateProyecto} = require('../validators/validatorProjects.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const projectRouter = express.Router();



/**
 * @swagger
 * /crearProyecto:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proyecto'
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: El proyecto ya existe para este usuario o cliente
 *       500:
 *         description: Error al crear el proyecto
 */

/**
 * @swagger
 * /actualizarProyecto/{id}:
 *   put:
 *     summary: Actualizar un proyecto existente
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto a actualizar
 *         schema:
 *           type: string
 *       - in: body
 *         name: proyecto
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ProyectoUpdate'
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error al actualizar el proyecto
 */

/**
 * @swagger
 * /listarProyectos:
 *   get:
 *     summary: Listar todos los proyectos del usuario
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clientId
 *         description: Filtrar por clientId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *       500:
 *         description: Error al obtener los proyectos
 */

/**
 * @swagger
 * /encontrarProyecto/{id}:
 *   get:
 *     summary: Buscar un proyecto por su ID
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error al obtener el proyecto
 */

/**
 * @swagger
 * /borrarProyecto/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft delete o hard delete)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto a eliminar
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         description: Indicar si es un soft delete
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado o no autorizado
 *       500:
 *         description: Error al eliminar el proyecto
 */

/**
 * @swagger
 * /listarArchivados:
 *   get:
 *     summary: Listar proyectos archivados (soft deleted)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 *       500:
 *         description: Error al obtener los proyectos archivados
 */

/**
 * @swagger
 * /recuperarProyecto/{id}:
 *   patch:
 *     summary: Recuperar un proyecto archivado
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto a recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto recuperado correctamente
 *       404:
 *         description: Proyecto no encontrado o no autorizado
 *       500:
 *         description: Error al recuperar el proyecto
 */

/**
 * @swagger
 * /borrarProyecto/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft delete o hard delete)
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto a eliminar
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         description: Indicar si es un soft delete 
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado o no autorizado
 *       500:
 *         description: Error al eliminar el proyecto
 */

projectRouter.use(express.json());

projectRouter.post('/crearProyecto',authMiddleware, validatorCrearProyecto ,crearProyecto);
projectRouter.put('/actualizarProyecto/:id',authMiddleware, validatorUpdateProyecto, updateProyecto);
projectRouter.get('/listarProyectos',authMiddleware, listarProyectos);
projectRouter.get('/encontrarProyecto/:id',authMiddleware, encontrarProyecto);
projectRouter.delete('/borrarProyecto/:id',authMiddleware, deleteProyecto);
projectRouter.get('/listarArchivados',authMiddleware, listarArchivados);
projectRouter.patch('/recuperarProyecto/:id',authMiddleware, recuperarProyecto);


module.exports = projectRouter;