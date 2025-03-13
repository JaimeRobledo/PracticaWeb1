const userModel = require('../models/users.js')

const getItems = async (req, res) => {
    const result = await userModel.find()
    console.log("Users encontrados", result)
    res.status(201).json(result)
}

const createItem = async (req, res) => {
    const result = await userModel.create(req.body)
    console.log("User creado", result)
    res.status(201).json(result)
}

module.exports = { getItems, createItem }