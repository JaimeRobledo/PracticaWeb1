const projectModel = require('../models/projects.js')
const clientModel = require('../models/clients.js');
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const verificarClienteDelUsuario = async (clientId, usuarioId) => {
    return await clientModel.findOne({ _id: clientId, usuarioId });
};

const crearProyecto = async (req, res) => {
    try {
        const { nombre, codigo, projectCode, fechaInicio, fechaFinal, notes, address, usuarioId, clientId } = req.body
    
        const cliente = await verificarClienteDelUsuario(clientId, usuarioId);
        console.log("Resultado de verificación:", cliente);
        if (!cliente) return res.status(403).json({ message: "Cliente no encontrado o no autorizado" });

        const proyectoExistente = await projectModel.findOne({codigo,  clientId})
    
        if (proyectoExistente) {
          return res.status(400).json({ message: "El proyecto ya existe para este usuario o cliente" })
        }
    
        const nuevoProyecto = await projectModel.create({
            nombre,
            codigo,
            projectCode,
            fechaInicio,
            fechaFinal,
            notes,
            address,
            usuarioId,
            clientId
        })
    
        await nuevoProyecto.save()
    
        return res.status(201).json({ message: "Proyecto creado", proyecto: nuevoProyecto })
      } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al crear el proyecto" })
      }
    
}

const updateProyecto = async (req, res) => {
    const { id } = req.params
    const { nombre, codigo, projectCode, fechaInicio, fechaFinal, notes, address, usuarioId, clientId } = req.body

  
    try {
        const cliente = await verificarClienteDelUsuario(clientId, usuarioId);
        console.log("Resultado de verificación:", cliente);
        if (!cliente) return res.status(403).json({ message: "Cliente no encontrado o no autorizado" });

      const proyectoActualizado = await projectModel.findByIdAndUpdate( { _id: id, clientId }, { nombre, codigo, projectCode, fechaInicio, fechaFinal, notes, address, usuarioId, clientId }, { new: true })
  
      if (!proyectoActualizado) {
        return res.status(404).json({ message: "Proyecto no encontrado" })
      }
  
      return res.status(200).json({ message: "Proyecto actualizado", proyecto: proyectoActualizado })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: "Error al actualizar el proyecto" })
    }
  }

  const listarProyectos = async (req, res) => {
    try {
        const usuarioId = req.user._id; // ID del usuario
        const clienteId = req.query.clientId; // Opcional: Si se pasa un clientId, filtra por ese cliente
    
        // Si se pasa un clientId en la query, buscar proyectos solo de ese cliente
        if (clienteId) {
          const cliente = await verificarClienteDelUsuario(clienteId, usuarioId);
          if (!cliente) return res.status(403).json({ message: "Cliente no autorizado" });
          
          const proyectos = await projectModel.find({ clientId: clienteId });
          return res.status(200).json(proyectos);
        }
    
        // Si no se pasa un clientId, buscar todos los clientes asociados al usuario
        const clientes = await clientModel.find({ usuarioId });
        const clienteIds = clientes.map(c => c._id);
    
        const proyectos = await projectModel.find({ clientId: { $in: clienteIds } });
        return res.status(200).json(proyectos);
    
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los proyectos" });
      }
    };

  const encontrarProyecto = async (req, res) => {
    try {
        const usuarioId = req.user._id; // ID del usuario actual
        const { id } = req.params; // ID del proyecto a buscar
        const clienteId = req.query.clientId; // Opcional: Filtra por clientId si se pasa en la query
    
        // Si se pasa un clientId, verificar que el cliente pertenece al usuario
        if (clienteId) {
          const cliente = await verificarClienteDelUsuario(clienteId, usuarioId);
          if (!cliente) return res.status(403).json({ message: "Cliente no autorizado" });
    
          const proyecto = await projectModel.findOne({ _id: id, clientId: clienteId });
          if (!proyecto) {
            return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
          }
          return res.status(200).json(proyecto);
        }
    
        // Si no se pasa clientId, verificar si el proyecto pertenece a los clientes del usuario
        const clientes = await clientModel.find({ usuarioId });
        const clienteIds = clientes.map(c => c._id);
    
        const proyecto = await projectModel.findOne({ _id: id, clientId: { $in: clienteIds } });
        if (!proyecto) {
          return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
        }
        return res.status(200).json(proyecto);
    
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener el proyecto" });
      }
    };

const deleteProyecto = async (req, res) => {
    const usuarioId = req.user._id;
    const proyectoId = req.params.id;
    const { clientId } = req.query;


    const softDelete = req.query.soft !== "false"

    const cliente = await verificarClienteDelUsuario(clientId, usuarioId);
    console.log("Resultado de verificación:", cliente);
    if (!cliente) return res.status(403).json({ message: "Cliente no autorizado" });

    if (softDelete) {
      const proyecto = await projectModel.findOne({ _id: proyectoId, clientId  });
      if (!proyecto) return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });

      await proyecto.delete(); // método de mongoose-delete
      return res.status(200).json({ message: "Proyecto desactivado correctamente" });
    }

    const result = await projectModel.deleteOne({ _id: proyectoId, clientId  });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado para hard delete" });
    }

    return res.status(200).json({ message: "Proyecto eliminado correctamente" });

}

const listarArchivados = async (req, res) => {
    try {
        const usuarioId = req.user._id;
        const { clientId } = req.query;

        const cliente = await verificarClienteDelUsuario(clientId, usuarioId);
        console.log("Resultado de verificación:", cliente);
        if (!cliente) return res.status(403).json({ message: "Cliente no autorizado" });
    
        const result = await projectModel.findDeleted({clientId});
    
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los proyectos archivados" });
      }
}

const recuperarProyecto = async (req, res) => {
    try {
        const usuarioId = req.user._id;
        const { id } = req.params;
        const { clientId } = req.query;

        const cliente = await verificarClienteDelUsuario(clientId, usuarioId);
        console.log("Resultado de verificación:", cliente);
        if (!cliente) return res.status(403).json({ message: "Cliente no autorizado" });
    
        const proyecto = await projectModel.findOneWithDeleted({ _id: id, clientId })

        if (!proyecto) {
            return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" })
        }

        // Restaurar con mongoose-delete
        await proyecto.restore()

        return res.status(200).json({ message: "Proyecto recuperado correctamente" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error al recuperar el proyecto" })
    }
}

module.exports = {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto}