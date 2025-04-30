const clientModel = require('../models/clients.js')
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
      const token = req.headers.authorization?.split(' ').pop();
      const dataToken = await verifyToken(token);
      if (!dataToken) return handleHttpError(res, "INVALID_TOKEN", 401);
  
      const { _id: usuarioId, companiaId } = dataToken;
  
      const result = await clientModel.findOne({usuarioId, companiaId});
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener los clientes" });
    }
  };

  const encontrarClient = async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ').pop();
      const dataToken = await verifyToken(token);
      if (!dataToken) return handleHttpError(res, "INVALID_TOKEN", 401);
  
      const { _id: usuarioId, companiaId } = dataToken;
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

    const clientId = req.params.id;

    const softDelete = req.query.soft !== "false"

    if (softDelete) {
      const client = await clientModel.findOne({ _id: clientId, usuarioId: dataToken._id });
      if (!client) return res.status(404).json({ message: "Cliente no encontrado o no autorizado" });

      await client.delete(); // método de mongoose-delete
      return res.status(200).json({ message: "Cliente desactivado correctamente" });
    }

    const result = await clientModel.deleteOne({ _id: clientId, usuarioId: dataToken._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado o no autorizado para hard delete" });
    }

    return res.status(200).json({ message: "Cliente eliminado correctamente" });

}

const listarArchivados = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ').pop();
        const dataToken = await verifyToken(token);
        if (!dataToken) return handleHttpError(res, "INVALID_TOKEN", 401);
    
        const { _id: usuarioId, companiaId } = dataToken;
    
        const result = await clientModel.findDeleted({usuarioId, companiaId});
    
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los clientes archivados" });
      }
}



module.exports = {crearCliente, updateClient, listarClients, encontrarClient, deleteClient, listarArchivados}