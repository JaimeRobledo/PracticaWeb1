/*
email
password
intentos
codigo_validacion
estado, si esta validado o no
rol
*/ 

/*
Register: user,pasword enviados, envia correo con codigo de validacion y devuelvo el token, respondemos con un mensaje
Validacion: user, codigo_validacion, si es correcto, se cambia el estado a true y se responde con un mensaje
Login: user, password, si es correcto, se responde con un token, si no, se suma un intento y se responde con un mensaje
*/

/*
al hacer el registro, se envia un correo con un codigo de validacion
al hacer login, se verifica si esta validado o no
si no esta validado, se da error
si esta validado, se le da acceso
si se equivoca en la contraseña, se le suma un intento
si se equivoca 3 veces, se le bloquea la cuenta
*/ 

const mongoose = require("mongoose")
const UserScheme = new mongoose.Schema(
 {
 email: {
 type: String,
 unique: true,
 required: true
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
},
bloqueado: {
  type: Boolean, // Se bloqueará tras 3 intentos fallidos
  default: false,
},
},
{
timestamps: true, // TODO createdAt, updatedAt
versionKey: false
}
)
module.exports = mongoose.model("users", UserScheme) // “users” es el nombre de la colección en mongoDB (o de la tabla en SQL)
