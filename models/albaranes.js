const mongoose = require("mongoose")
const mongooseDelete = require('mongoose-delete');
const AlbaranScheme = new mongoose.Schema(
{
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Client", 
        required: true 
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project", 
        required: true 
    },
    format: { 
        type: String, 
        enum: ["hours", "material", "any"], 
        required: true 
    },
    workdate: { 
        type: Date, 
        required: true 
    },
    pending: { 
        type: Boolean, 
        default: true 
    },
    company: String,
    hours: Number,
    quantity: Number,
    descriptionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Description" 
    },
    multi: [{
    name: String,
    hours: Number,
    description: String,
    descriptionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Description" 
    }
    }],
    materials: [{
    description: String,
    quantity: Number,
    descriptionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Description" 
    }
    }],
    concepts: [{
    workerName: String,
    quantity: Number,
    conceptId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Description" 
    }
    }],
    signed: { 
        type: Boolean, 
        default: false
    },
    signatureUrl: String,
    pdfUrl: String
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)
AlbaranScheme.plugin(mongooseDelete, {overrideMethods: "all"})
module.exports = mongoose.model("albaranes", AlbaranScheme) 