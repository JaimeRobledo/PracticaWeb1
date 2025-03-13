const express = require('express');
const {getItems, createItem} = require('../controlers/users.js');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/', createItem);

module.exports = userRouter;