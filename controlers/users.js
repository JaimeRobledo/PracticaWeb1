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

const updateDatosPersonales = async (req, res) => {
    const {nombre, apellidos, nif} = req.body
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

    const user = await userModel.updateOne({_id: dataToken._id}, {nombre, apellidos, nif})
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    
    }
    res.status(201).json({message: "Usuario actualizado correctamente:",user, nombre, apellidos, nif})

}

const updateDatosCompany = async (req, res) => {

    const { autonomo, company } = req.body;
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

    let datosCompany;
    // Si el usuario es autonomo, se le asigna el nombre del usuario como nombre de la empresa  
    // y el cif como el nif del usuario
    // Si no, se le asigna el nombre de la empresa y el cif de la empresa

    const usuario = await userModel.findOne({_id: dataToken._id})
     
    if (autonomo) {
        datosCompany = {company: { name: usuario.nombre, cif: usuario.nif, address: company.address }}
    }
    else {
        datosCompany = {company: { name: company.name, cif: company.cif, address: company.address }}
    }
    

    const user = await userModel.updateOne({_id: dataToken._id}, {autonomo,  company: datosCompany.company})
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    
    }
    res.status(201).json({message: "Usuario actualizado correctamente:",user, company: datosCompany.company})

}

const getPorJWT = async (req, res) => {
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
    res.status(201).json({message: "Usuario encontrado correctamente:",user})

}

const deleteUser = async (req, res) => {
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

    const softDelete = req.query.soft !== "false"

    if(softDelete){
        const user = await userModel.updateOne({_id: dataToken._id}, {estado: false})
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        
        }
        res.status(201).json({message: "Usuario desactivado correctamente:",user})
    }else{
        const user = await userModel.deleteOne({_id: dataToken._id})
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        
        }
        res.status(201).json({message: "Usuario eliminado correctamente:",user})
    }

}

const recuperarPassword = async (req, res) => {

    const { email } = req.body;
    const user = await userModel.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const codigo_recuperacion = Math.floor(100000 + Math.random() * 900000).toString();
    await  userModel.updateOne({ email: email }, { codigo_validacion: codigo_recuperacion });
    const token = tokenSign(user)

    res.status(200).json({ message: "Código de recuperación enviado a tu email.",codigo_recuperacion, token });
}

const validarRecuperacion = async (req, res) => {
    const {codigo_validacion} = req.body

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

    console.log("Usuario:", user.email, user.codigo_validacion)

    if (user.codigo_validacion !== codigo_validacion) {
        return res.status(400).json({ message: "Código de validación incorrecto" });
    }

    await user.save()

    res.status(201).json({message: "Restablecimiento de password validado correctamente",token})
   
}

const restablecerPassword = async (req, res) => {

    const { password} = req.body

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

    const hashedPassword = await encrypt(password);

        // Actualizar la contraseña y eliminar el código de recuperación
        user.password = hashedPassword;
        user.codigo_recuperacion = null;
        await user.save();

        res.status(200).json({ message: "Contraseña restablecida correctamente" });
        console.log("Contraseña restablecida:",user.email, user.hashedPassword)

}



const invitarGuest = async (req, res) => {
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
        return res.status(404).json({ message: "Usuario Host no encontrado" });
    
    }

    const {email} = req.body
    const usuarioExistente = await userModel.findOne({email})
    if(usuarioExistente){
        return res.status(409).json({message: "Guest ya existe"})
    }

    const codigo_validacion = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await userModel.create({
        email,
        codigo_validacion,
        estado: false,
        role: "guest"
    });

    console.log("User invitado", result.email, result.role, result.estado);
    res.status(201).json({
        email: result.email,
        role: result.role,
        estado: result.estado
        });

}

const uploadLogo = async (req, res) => {

    if (!req.headers.authorization) {
        return res.status(401).json({ message: "NOT_TOKEN" });
    }

    const token = req.headers.authorization.split(' ').pop();
    const dataToken = await verifyToken(token);
    if (!dataToken) {
        return res.status(401).json({ message: "INVALID_TOKEN" });
    }
    
    if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ninguna imagen" });
    }

    

    const filePath = `/AlmacenLogos/${req.file.filename}`; // Ruta del archivo guardado

    const user = await userModel.findOne({ _id: dataToken._id });
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.logo === filePath) {
        return res.status(400).json({ message: "Este logo ya está registrado" });
    }

    await userModel.findOneAndUpdate(
        { _id: dataToken._id },
        { logo: filePath },
        { new: true }
    );

    res.status(200).json({ message: "Logo actualizado correctamente", logo: filePath });
};


    


module.exports = { getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT, deleteUser, recuperarPassword, validarRecuperacion, restablecerPassword, invitarGuest, uploadLogo }