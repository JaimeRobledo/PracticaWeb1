const express = require('express');
const {getItems} = require('../controlers/users.js');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/', (req, res) => {
    res.send("POST de users")
}
);

module.exports = userRouter;