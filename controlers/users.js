const userModel = require('../models/users.js')
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')

const getItems = async (req, res) => {
    const result = await userModel.find()
    console.log("Users encontrados", result)
    res.status(201).json(result)
}

const createItem = async (req, res) => {
    const {email, password, role} = req.body

    const usuarioExistente = await userModel.findOne({email})
    if(usuarioExistente){
        return res.status(409).json({message: "Usuario ya existe"})
    }

    const hashedPassword = await encrypt(password);

    const codigo_validacion = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await userModel.create({
        email,
        password: hashedPassword,
        role,
        codigo_validacion,
        estado: false

    });

    const token = tokenSign(result)

    console.log("User creado", result.email, result.role, result.estado, token);
    res.status(201).json({
        email: result.email,
        role: result.role,
        estado: result.estado,
        token
        });



}

const validateItem = async (req, res) => {
    console.log("Body recibido:", req.body);
    const {codigo_validacion} = req.body
    console.log("Codigo de validación recibido:", codigo_validacion)

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

    const user = await userModel.findOne({_id: dataToken._id})
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.estado) {
        return res.status(400).json({ message: "Usuario ya validado" });
    }

    console.log("Usuario:", user.email, user.codigo_validacion, user.estado)

    if (user.codigo_validacion !== codigo_validacion) {
        return res.status(400).json({ message: "Código de validación incorrecto" });
    }

    user.estado = true
    await user.save()
    res.status(201).json({message: "Usuario validado correctamente"})
   
}

const loginItem = async (req, res) => {
    const {email, password} = req.body

    const user = await userModel.findOne({email})
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!user.estado) {
        return res.status(400).json({ message: "Usuario no validado" });
    }

    if (user.bloqueado) {
        return res.status(400).json({ message: "Usuario bloqueado" });
    }

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) {
        user.intentos++
        if (user.intentos >= 3) {
            user.bloqueado = true
        }
        await user.save()
        return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = tokenSign(user)

    res.status(201).json({message: "Usuario logueado correctamente",user, token})
}

module.exports = { getItems, createItem, validateItem, loginItem }