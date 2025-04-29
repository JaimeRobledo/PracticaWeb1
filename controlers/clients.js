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
    const result = await clientModel.find()
    console.log("Clients encontrados", result)
    res.status(201).json(result)
}

const encontrarClient = async (req, res) => {
    const {id} = req.params
    const result = await clientModel.findById(id)
    console.log("Cliente encontrado", result)
    res.status(201).json(result)
}

const deleteClient = async (req, res) => {
    if (!req.headers.authorization) {
        handleHttpError(res, "NOT_TOKEN", 401)
        return
    }
    // Nos llega la palabra reservada Bearer (es un estándar) y el Token, así que me quedo con la última parte
    const token = req.headers.authorization.split(' ').pop()
    //Del token, miramos en Payload (revisar verifyToken de utils/handleJwt)
    const dataToken = await verifyToken(token)
    console.log(dataToken)
    if(!dataToken) {
        handleHttpError(res, "INVALID_TOKEN", 401)
        return
    }

    const softDelete = req.query.soft !== "false"

    if(softDelete){
        const user = await clientModel.updateOne({_id: dataToken._id}, {estado: false})
        if (!user) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        
        }
        res.status(201).json({message: "Cliente desactivado correctamente:",user})
    }else{
        const user = await clientModel.deleteOne({_id: dataToken._id})
        if (!user) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        
        }
        res.status(201).json({message: "Cliente eliminado correctamente:",user})
    }

}

module.exports = {crearCliente, updateClient, listarClients, encontrarClient, deleteClient}