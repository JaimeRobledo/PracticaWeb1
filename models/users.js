/*
email
password
intentos
codigo_validacion
estado, si esta validado o no
rol
*/ 

const mongoose = require("mongoose")
const UserScheme = new mongoose.Schema(
 {
 email: {
 type: String,
 unique: true
 },
 password:{
 type: String // TODO Guardaremos el hash
 },
 role:{
 type: ["user", "admin"], // es el enum de SQL
 default: "user"
 },
intentos:{
    type: Number,
    default: 0
},
codigo_validacion:{
    type: String,
},
estado:{
    type: Boolean,
    default: false
}
},
{
timestamps: true, // TODO createdAt, updatedAt
versionKey: false
}
)
module.exports = mongoose.model("users", UserScheme) // “users” es el nombre de la colección en mongoDB (o de la tabla en SQL)
