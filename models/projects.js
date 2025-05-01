const mongoose = require("mongoose")
const mongooseDelete = require('mongoose-delete');
const ProjectScheme = new mongoose.Schema(
{
    nombre: {
        type: String,
        required: true,
      },
      codigo: {
        type: String,
        required: true,
        unique: true,
      },
      projectCode: {
        type: String,
        required: true,
      },
      fechaInicio: {
        type: String, 
        required: true,
      },
      fechaFinal: {
        type: String,
        required: true,
      },
      notes: {
        type: String,
        default: "",
      },
      address: {
        type: {
            street: { 
                type: String, required: true 
            },
            number: { 
                type: Number, required: true 
            },
            postal: { 
                type: Number, required: true 
            },
            city: { 
                type: String, required: true 
            },
            province: { 
                type: String, required: true 
            }
          },
        required: true,
      },
      usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',  // Asocia a un usuario
        required: true,
      },
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',  // Asocia a clientes 
        required: true,
      },
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)
ProjectScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("clients", ProjectScheme) 