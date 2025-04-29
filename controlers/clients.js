const clientModel = require('../models/clients.js')
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')

const crearCliente = async (req, res) => {
    try {
        const {nombre, email, telefono, direccion, companiaId} = req.body
        const usuarioId = req.user.id

        const clienteExistente = await clientModel.findOne({email, usuarioId, companiaId})
        if (clienteExistente) {
            return res.status(400).json({message: "El cliente ya existe"})
        }
        const nuevoCliente = new clientModel({
            nombre,
            email,
            telefono,
            direccion,
            usuarioId,
            companiaId
        })    
        await nuevoCliente.save()
        return res.status(201).json({message: "Cliente creado", cliente: nuevoCliente})
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Error al crear el cliente"})
    }
    
}

module.exports = {crearCliente}