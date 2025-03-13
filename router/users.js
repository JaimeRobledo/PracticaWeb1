const express = require('express');
const {getItems, createItem} = require('../controlers/users.js');
const { validatorRegister } = require('../validators/auth.js');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

module.exports = userRouter;