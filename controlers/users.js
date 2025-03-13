const userModel = require('../models/users.js')

const getItems = async (req, res) => {
    const result = await userModel.find()
    console.log("Users encontrados", result)
    res.status(201).json(result)
}

module.exports = { getItems }