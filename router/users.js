const express = require('express');
const userRouter = express.Router();

userRouter.use(express.json());

userRouter.get('/', (req, res) => {
    res.send("GET de users")
}
);

module.exports = userRouter;