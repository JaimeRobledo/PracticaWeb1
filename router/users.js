const express = require('express');
const {getItems, createItem, validateItem, loginItem} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin } = require('../validators/auth.js');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

userRouter.post('/validate', validatorCodigo ,validateItem);

userRouter.post('/login', validatorLogin ,loginItem);

module.exports = userRouter;