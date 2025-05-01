const clientModel = require('../models/clients.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const crearCliente = async (req, res) => {
    try {
        const { nombre, cif, address, usuarioId, companiaId } = req.body
    
        // Compruebo si ya existe un cliente con ese CIF para ese usuario o su compañía
        const clienteExistente = await clientModel.findOne({cif, usuarioId, companiaId})
    
        if (clienteExistente) {
          return res.status(400).json({ message: "El cliente ya existe para este usuario o compañía" })
        }
    
        const nuevoCliente = await clientModel.create({
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
    try {
      const { _id: usuarioId, companiaId } = req.user
  
      const result = await clientModel.find({usuarioId, companiaId});
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener los clientes" });
    }
  };

  const encontrarClient = async (req, res) => {
    try {
      const { _id: usuarioId, companiaId } = req.user
      const { id } = req.params;
  
      const result = await clientModel.findOne({ _id: id, usuarioId, companiaId});
  
      if (!result) {
        return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });
      }
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener el cliente" });
    }
  };

const deleteClient = async (req, res) => {
    const { _id: usuarioId } = req.user

    const clientId = req.params.id;

    const softDelete = req.query.soft !== "false"

    if (softDelete) {
      const client = await clientModel.findOne({ _id: clientId, usuarioId });
      if (!client) return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });

      await client.delete(); // método de mongoose-delete
      return res.status(200).json({ message: "Cliente desactivado correctamente" });
    }

    const result = await clientModel.deleteOne({ _id: clientId, usuarioId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado para hard delete" });
    }

    return res.status(200).json({ message: "Cliente eliminado correctamente" });

}

const listarArchivados = async (req, res) => {
    try {
      const { _id: usuarioId, companiaId } = req.user
    
        const result = await clientModel.findDeleted({usuarioId, companiaId});
    
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los clientes archivados" });
      }
}

const recuperarCliente = async (req, res) => {
    try {
      const { _id: usuarioId, companiaId } = req.user
        const { id } = req.params;
    
        const cliente = await clientModel.findOneWithDeleted({ _id: id, usuarioId, companiaId })

        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado o no autorizado" })
        }

        // Restaurar con mongoose-delete
        await cliente.restore()

        return res.status(200).json({ message: "Cliente recuperado correctamente" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al recuperar el cliente" })
    }
}


module.exports = {crearCliente, updateClient, listarClients, encontrarClient, deleteClient, listarArchivados, recuperarCliente}