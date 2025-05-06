const express = require('express');
const {crearCliente, updateClient, listarClients, encontrarClient, deleteClient, listarArchivados, recuperarCliente} = require('../controlers/clients.js');
const {validatorCrearCliente, validatorUpdateClient} = require('../validators/validatorClients.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const clientRouter = express.Router();

/**
 * @swagger
 * /crearCliente:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Datos del cliente a crear
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *               cif:
 *                 type: string
 *                 description: CIF del cliente
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario asociado
 *               companiaId:
 *                 type: string
 *                 description: ID de la compañía asociada
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       400:
 *         description: El cliente ya existe para este usuario o compañía
 *       500:
 *         description: Error al crear el cliente
 */

/**
 * @swagger
 * /actualizarCliente/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Datos actualizados del cliente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del cliente
 *               cif:
 *                 type: string
 *                 description: CIF del cliente
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario asociado
 *               companiaId:
 *                 type: string
 *                 description: ID de la compañía asociada
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al actualizar el cliente
 */

/**
 * @swagger
 * /listarClientes:
 *   get:
 *     summary: Listar todos los clientes del usuario
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       500:
 *         description: Error al obtener los clientes
 */

/**
 * @swagger
 * /encontrarCliente/{id}:
 *   get:
 *     summary: Obtener un cliente por su ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error al obtener el cliente
 */

/**
 * @swagger
 * /borrarCliente/{id}:
 *   delete:
 *     summary: Eliminar un cliente (soft delete o hard delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a eliminar
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         description: Indicar si es un soft delete. Si no se indica, se realiza soft delete por defecto.
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado o no autorizado
 *       500:
 *         description: Error al eliminar el cliente
 */

/**
 * @swagger
 * /listarArchivados:
 *   get:
 *     summary: Listar los clientes archivados
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *       500:
 *         description: Error al obtener los clientes archivados
 */


/**
 * @swagger
 * /recuperarCliente/{id}:
 *   patch:
 *     summary: Recuperar un cliente archivado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a recuperar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente recuperado correctamente
 *       404:
 *         description: Cliente no encontrado o no autorizado
 *       500:
 *         description: Error al recuperar el cliente
 */

clientRouter.use(express.json());

clientRouter.post('/crearCliente', authMiddleware,validatorCrearCliente ,crearCliente);
clientRouter.put('/actualizarCliente/:id', authMiddleware,validatorUpdateClient, updateClient);
clientRouter.get('/listarClientes',authMiddleware, listarClients);
clientRouter.get('/encontrarCliente/:id',authMiddleware, encontrarClient);
clientRouter.delete('/borrarCliente/:id',authMiddleware, deleteClient);

/**
 * @swagger
 * /listarArchivados:
 *   get:
 *     summary: Listar todos los clientes archivados (soft delete)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID único del cliente
 *                   nombre:
 *                     type: string
 *                     description: Nombre del cliente
 *                   cif:
 *                     type: string
 *                     description: CIF del cliente
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       number:
 *                         type: number
 *                       postal:
 *                         type: number
 *                       city:
 *                         type: string
 *                       province:
 *                         type: string
 *                   usuarioId:
 *                     type: string
 *                     description: ID del usuario asociado
 *                   companiaId:
 *                     type: string
 *                     description: ID de la compañía asociada
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de creación
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de última actualización
 *                   deletedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de eliminación (si es un soft delete)
 *       500:
 *         description: Error al obtener los clientes archivados
 */

clientRouter.get('/listarArchivados',authMiddleware, listarArchivados);
clientRouter.patch('/recuperarCliente/:id',authMiddleware, recuperarCliente);


module.exports = clientRouter;