const mongoose = require("mongoose")
const mongooseDelete = require('mongoose-delete');

// Primero definimos el esquema principal
const AlbaranScheme = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
      },
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
      },
      format: {
        type: String,
        enum: ['hours', 'material', 'any'],
        required: true
      },
      hours: {
        type: Number,
        required: function() {
          return this.format === 'hours';
        }
      },
      quantity: {
        type: Number,
        required: function() {
          return this.format === 'material';
        }
      },
      descriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      workdate: {
        type: Date,
        required: true,
        default: Date.now
      },
      pending: {
        type: Boolean,
        default: true
      },
      company: {
        type: String
      },
      deleted: {
        type: Boolean,
        default: false
      },
      sign: {
        type: String  // URL a la imagen de la firma
      },
      pdf: {
        type: String  // URL al PDF generado
      },
      description: {
        type: String
      },
      // Definimos los arrays como esquemas embebidos directamente
      multi: [
        {
          name: {
            type: String,
            required: true
          },
          hours: {
            type: Number,
            required: true
          },
          description: {
            type: String,
            required: true
          },
          descriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          }
        }
      ],
      materials: [
        {
          description: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          descriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          }
        }
      ],
      concepts: [
        {
          workerName: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          conceptId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          }
        }
      ]
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)
AlbaranScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("albaranes", AlbaranScheme) 