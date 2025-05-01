const projectModel = require('../models/projects.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

const crearProyecto = async (req, res) => {
    try {
        const { nombre, codigo, projectCode, fechaInicio, fechaFinal, notes, address, usuarioId, clientId } = req.body
    
        const proyectoExistente = await projectModel.findOne({codigo, usuarioId, clientId})
    
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
      const proyectoActualizado = await projectModel.findByIdAndUpdate( id, { nombre, codigo, projectCode, fechaInicio, fechaFinal, notes, address, usuarioId, clientId }, { new: true })
  
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
      const { _id: usuarioId, clientId } = req.user
  
      const result = await projectModel.find({usuarioId, clientId});
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener los proyectos" });
    }
  };

  const encontrarProyecto = async (req, res) => {
    try {
      const { _id: usuarioId, clientId } = req.user
      const { id } = req.params;
  
      const result = await projectModel.findOne({ _id: id, usuarioId, clientId});
  
      if (!result) {
        return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });
      }
  
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al obtener el proyecto" });
    }
  };

const deleteProyecto = async (req, res) => {
    const { _id: usuarioId } = req.user

    const proyectoId = req.params.id;

    const softDelete = req.query.soft !== "false"

    if (softDelete) {
      const proyecto = await projectModel.findOne({ _id: proyectoId, usuarioId });
      if (!proyecto) return res.status(404).json({ message: "Proyecto no encontrado o no autorizado" });

      await proyecto.delete(); // método de mongoose-delete
      return res.status(200).json({ message: "Proyecto desactivado correctamente" });
    }

    const result = await projectModel.deleteOne({ _id: proyectoId, usuarioId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Proyecto no encontrado o no autorizado para hard delete" });
    }

    return res.status(200).json({ message: "Proyecto eliminado correctamente" });

}

const listarArchivados = async (req, res) => {
    try {
      const { _id: usuarioId, clientId } = req.user
    
        const result = await projectModel.findDeleted({usuarioId, clientId});
    
        return res.status(200).json(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al obtener los proyectos archivados" });
      }
}

const recuperarProyecto = async (req, res) => {
    try {
      const { _id: usuarioId, clientId } = req.user
        const { id } = req.params;
    
        const proyecto = await projectModel.findOneWithDeleted({ _id: id, usuarioId, clientId })

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