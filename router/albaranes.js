const express = require('express');
const {crearAlbaran, getAlbaranes, getAlbaran, getPdfAlbaran, firmarAlbaran, borrarAlbaran} = require('../controlers/albaranes.js');
const {validatorCrearAlbaran, validatorUpdateAlbaran} = require('../validators/validatorAlbaranes.js');
const {authMiddleware} = require('../middleware/authMiddleware.js');
const { uploadMiddlewareMemory} = require("../utils/handleStorage.js")
const albaranRouter = express.Router();


albaranRouter.use(express.json());

/**
 * @swagger
 * /crearAlbaran:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [hours, material, any]
 *               hours:
 *                 type: number
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *               workdate:
 *                 type: string
 *                 format: date
 *             required:
 *               - clientId
 *               - projectId
 *               - format
 *               - workdate
 *     responses:
 *       201:
 *         description: Albarán creado con éxito
 *       409:
 *         description: El albarán ya existe
 *       500:
 *         description: Error interno del servidor
 */

albaranRouter.post('/crearAlbaran', authMiddleware,validatorCrearAlbaran ,crearAlbaran);

/**
 * @swagger
 * /getAlbaranes:
 *   get:
 *     summary: Obtener todos los albaranes de un usuario
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: query
 *         description: Filtro para albaranes de un proyecto específico
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *       500:
 *         description: Error interno del servidor
 */

albaranRouter.get('/getAlbaranes', authMiddleware, getAlbaranes);

/**
 * @swagger
 * /getAlbaran/{id}:
 *   get:
 *     summary: Obtener un albarán por su ID
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno del servidor
 */

albaranRouter.get('/getAlbaran/:id', authMiddleware, getAlbaran);

/**
 * @swagger
 * /getPdfAlbaran/{id}:
 *   get:
 *     summary: Obtener el PDF de un albarán
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF del albarán
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno del servidor
 */

albaranRouter.get('/getPdfAlbaran/:id', authMiddleware, getPdfAlbaran);

/**
 * @swagger
 * /firmarAlbaran/{id}:
 *   post:
 *     summary: Firmar un albarán con una imagen
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error al firmar el albarán
 */

albaranRouter.post('/firmarAlbaran/:id', authMiddleware, uploadMiddlewareMemory.single("image"), firmarAlbaran);

/**
 * @swagger
 * /borrarAlbaran/{id}:
 *   delete:
 *     summary: Borrar un albarán
 *     tags: [Albaranes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán borrado correctamente
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error al borrar el albarán
 */

albaranRouter.delete('/borrarAlbaran/:id', authMiddleware, borrarAlbaran);

module.exports = albaranRouter;