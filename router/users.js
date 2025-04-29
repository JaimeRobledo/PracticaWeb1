const express = require('express');
const {getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT, deleteUser, recuperarPassword, validarRecuperacion, restablecerPassword, invitarGuest, uploadLogo} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany, validarGuest} = require('../validators/auth.js');
const userRouter = express.Router();

const { uploadMiddleware} = require("../utils/handleStorage.js")


userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

userRouter.post('/validate', validatorCodigo ,validateItem);

userRouter.post('/login', validatorLogin ,loginItem);

userRouter.put('/actualizarDatosPersonales', validatorDatosPersonales ,updateDatosPersonales);

userRouter.put('/actualizarDatosCompany', validatorDatosCompany ,updateDatosCompany);

userRouter.get('/porJWT', getPorJWT)

userRouter.delete('/deleteUser', deleteUser);

userRouter.put('/recuperarPassword',recuperarPassword);

userRouter.put('/validarRecuperacion', validatorCodigo , validarRecuperacion);

userRouter.put('/restablecerPassword',restablecerPassword);

userRouter.post('/invitar', validarGuest, invitarGuest);

userRouter.post("/logo", uploadMiddleware.single("image"), uploadLogo);


module.exports = userRouter;