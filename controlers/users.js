const userModel = require('../models/users.js')
const {encrypt} = require('../utils/validatePassword.js')
const {tokenSign} = require('../utils/encargarseJwt.js')

const getItems = async (req, res) => {
    const result = await userModel.find()
    console.log("Users encontrados", result)
    res.status(201).json(result)
}

const createItem = async (req, res) => {
    const {email, password, role} = req.body

    const usuarioExistente = await userModel.findOne({email})
    if(usuarioExistente){
        return res.status(409).json({message: "Usuario ya existe"})
    }

    const hashedPassword = await encrypt(password);

    const codigo_validacion = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await userModel.create({
        email,
        password: hashedPassword,
        role,
        codigo_validacion,
        estado: false

    });

    const token = tokenSign(result)

    console.log("User creado", result.email, result.role, result.estado, token);
    res.status(201).json({
        email: result.email,
        role: result.role,
        estado: result.estado,
        token
        });



}

const validateItem = async (req, res) => {

module.exports = { getItems, createItem, validateItem }