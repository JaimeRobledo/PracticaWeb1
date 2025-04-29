const clientModel = require('../models/clients.js')
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')

const crearCliente = async (req, res) => {
    try {
        const { nombre, cif, address, usuarioId, companiaId } = req.body
    
        // Compruebo si ya existe un cliente con ese CIF para ese usuario o su compañía
        const clienteExistente = await clientModel.findOne({cif, usuarioId, companiaId})
    
        if (clienteExistente) {
          return res.status(400).json({ message: "El cliente ya existe para este usuario o compañía" })
        }
    
        const nuevoCliente = new clientModel({
          nombre,
          cif,
          address,
          usuarioId,
          companiaId
        })
    
        await nuevoCliente.save()
    
        return res.status(201).json({ message: "Cliente creado", cliente: nuevoCliente })
      } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al crear el cliente" })
      }
    
}

const updateClient = async (req, res) => {
    const { id } = req.params
    const { nombre, cif, address, usuarioId, companiaId } = req.body
  
    try {
      const clienteActualizado = await clientModel.findByIdAndUpdate(
        id,
        { nombre, cif, address, usuarioId, companiaId },
        { new: true }
      )
  
      if (!clienteActualizado) {
        return res.status(404).json({ message: "Cliente no encontrado" })
      }
  
      return res.status(200).json({ message: "Cliente actualizado", cliente: clienteActualizado })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Error al actualizar el cliente" })
    }
  }

const listarClients = async (req, res) => {

}

module.exports = {crearCliente, updateClient, listarClients}