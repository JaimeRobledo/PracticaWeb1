const express = require('express');
const {getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany} = require('../validators/auth.js');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

userRouter.post('/validate', validatorCodigo ,validateItem);

userRouter.post('/login', validatorLogin ,loginItem);

userRouter.put('/actualizarDatosPersonales', validatorDatosPersonales ,updateDatosPersonales);

userRouter.put('/actualizarDatosCompany', validatorDatosCompany ,updateDatosCompany);

userRouter.get('/porJWT', getPorJWT)

module.exports = userRouter;