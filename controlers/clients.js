const clientModel = require('../models/clients.js')
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')

const crearCliente = async (req, res) => {
    const {nombre, email, telefono, direccion, usuarioId, companiaId} = req.body
    
    
}

module.exports = {}