const express = require('express');
const {getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT, deleteUser, recuperarPassword, validarRecuperacion, restablecerPassword, invitarGuest, uploadLogo} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany, validarGuest} = require('../validators/auth.js');
const userRouter = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware.js');
const { uploadMiddlewareMemory} = require("../utils/handleStorage.js")
const { validatorMail } = require('../validators/validatorMail.js');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operaciones relacionadas con los usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         estado:
 *           type: boolean
 *         intentos:
 *           type: number
 *         codigo_validacion:
 *           type: string
 *         bloqueado:
 *           type: boolean
 */


userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

userRouter.post('/validate',authMiddleware, validatorCodigo ,validateItem);

userRouter.post('/login', validatorLogin ,loginItem);

userRouter.put('/actualizarDatosPersonales',authMiddleware, validatorDatosPersonales ,updateDatosPersonales);

userRouter.put('/actualizarDatosCompany',authMiddleware, validatorDatosCompany ,updateDatosCompany);

userRouter.get('/porJWT',authMiddleware, getPorJWT)

userRouter.delete('/deleteUser',authMiddleware, deleteUser);

userRouter.put('/recuperarPassword',recuperarPassword);

userRouter.put('/validarRecuperacion',authMiddleware, validatorCodigo , validarRecuperacion);

userRouter.put('/restablecerPassword',authMiddleware,restablecerPassword);

userRouter.post('/invitar',authMiddleware, validarGuest, invitarGuest);

userRouter.post("/logo",authMiddleware, uploadMiddlewareMemory.single("image"), uploadLogo);



module.exports = userRouter;