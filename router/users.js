const express = require('express');
const {getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT, deleteUser, recuperarPassword, validarRecuperacion, restablecerPassword, invitarGuest, uploadLogo} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany, validarGuest} = require('../validators/auth.js');
const userRouter = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware.js');
const { uploadMiddlewareMemory} = require("../utils/handleStorage.js")
const { validatorMail } = require('../validators/validatorMail.js');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: usuario@dominio.com
 *                   role:
 *                     type: string
 *                     example: user
 */


userRouter.use(express.json());

userRouter.get('/', getItems);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@dominio.com
 *               password:
 *                 type: string
 *                 example: "12345"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: Usuario ya existe
 */

userRouter.post('/register', validatorRegister ,createItem);

/**
 * @swagger
 * /users/validate:
 *   post:
 *     summary: Validar el código de un usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código validado con éxito
 *       400:
 *         description: Código inválido o expirado
 */

userRouter.post('/validate',authMiddleware, validatorCodigo ,validateItem);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@dominio.com
 *               password:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, devuelve el token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt_token"
 *       401:
 *         description: Credenciales incorrectas
 */

userRouter.post('/login', validatorLogin ,loginItem);

/**
 * @swagger
 * /users/actualizarDatosPersonales:
 *   put:
 *     summary: Actualizar los datos personales del usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               direccion:
 *                 type: string
 *                 example: Calle Ficticia 123
 *     responses:
 *       200:
 *         description: Datos personales actualizados
 *       400:
 *         description: Datos inválidos
 */

userRouter.put('/actualizarDatosPersonales',authMiddleware, validatorDatosPersonales ,updateDatosPersonales);

/**
 * @swagger
 * /users/actualizarDatosCompany:
 *   put:
 *     summary: Actualizar los datos de la empresa del usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               empresa:
 *                 type: string
 *                 example: "Tech Corp"
 *               direccion:
 *                 type: string
 *                 example: "Av. Empresarial 500"
 *     responses:
 *       200:
 *         description: Datos de empresa actualizados
 *       400:
 *         description: Datos inválidos
 */

userRouter.put('/actualizarDatosCompany',authMiddleware, validatorDatosCompany ,updateDatosCompany);

/**
 * @swagger
 * /users/porJWT:
 *   get:
 *     summary: Obtener datos de usuario a partir de JWT
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

userRouter.get('/porJWT',authMiddleware, getPorJWT)

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       404:
 *         description: Usuario no encontrado
 */

userRouter.delete('/deleteUser',authMiddleware, deleteUser);

/**
 * @swagger
 * /users/recuperarPassword:
 *   put:
 *     summary: Recuperar la contraseña de un usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@dominio.com
 *     responses:
 *       200:
 *         description: Se ha enviado un correo de recuperación
 *       400:
 *         description: Error al enviar el correo
 */

userRouter.put('/recuperarPassword',recuperarPassword);

/**
 * @swagger
 * /users/validarRecuperacion:
 *   put:
 *     summary: Validar el código de recuperación
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código de recuperación validado con éxito
 *       400:
 *         description: Código inválido
 */

userRouter.put('/validarRecuperacion',authMiddleware, validatorCodigo , validarRecuperacion);

/**
 * @swagger
 * /users/restablecerPassword:
 *   put:
 *     summary: Restablecer la contraseña de un usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida con éxito
 *       400:
 *         description: Error al restablecer la contraseña
 */

userRouter.put('/restablecerPassword',authMiddleware,restablecerPassword);

/**
 * @swagger
 * /users/invitar:
 *   post:
 *     summary: Invitar a un nuevo usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: invitado@dominio.com
 *     responses:
 *       200:
 *         description: Invitación enviada correctamente
 *       400:
 *         description: Error al enviar la invitación
 */

userRouter.post('/invitar',authMiddleware, validarGuest, invitarGuest);

/**
 * @swagger
 * /users/logo:
 *   post:
 *     summary: Subir un logo para el usuario
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *         description: Logo subido con éxito
 *       400:
 *         description: Error al subir el logo
 */

userRouter.post("/logo",authMiddleware, uploadMiddlewareMemory.single("image"), uploadLogo);



module.exports = userRouter;