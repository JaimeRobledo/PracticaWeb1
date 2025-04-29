const mongoose = require("mongoose")
const ClientScheme = new mongoose.Schema(
{
    nombre: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      telefono: {
        type: String,
        required: true,
      },
      direccion: {
        type: String,
        required: true,
      },
      usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Asocia a un usuario
        required: true,
      },
      companiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',  // Asocia a una compañía (si es necesario)
        required: false,
      },
      archivado: {
        type: Boolean,
        default: false,  // Para soft delete
      },
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)
module.exports = mongoose.model("clients", ClientScheme) 