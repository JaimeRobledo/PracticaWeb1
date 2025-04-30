const mongoose = require("mongoose")
const mongooseDelete = require('mongoose-delete');
const ClientScheme = new mongoose.Schema(
{
    nombre: {
        type: String,
        required: true,
      },
      cif: {
        type: String,
        required: true,
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
        ref: 'User',  // Asocia a un usuario
        required: true,
      },
      companiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',  // Asocia a una compañía (si es necesario)
        required: false,
      },
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)
ClientScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("clients", ClientScheme) 