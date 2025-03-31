const express = require('express');
const {getItems, createItem, validateItem, loginItem, updateDatosPersonales, updateDatosCompany, getPorJWT, deleteUser, recuperarPassword, validarRecuperacion, restablecerPassword, invitarGuest, uploadLogo} = require('../controlers/users.js');
const { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany, validarGuest} = require('../validators/auth.js');
const userRouter = express.Router();

const { uploadMiddleware} = require("../utils/handleStorage.js")
const multer = require("multer")
const storage = multer.diskStorage({
    destination:function(req, file, callback){ //Pasan argumentos automáticamente
        const pathStorage = __dirname+"/../storage"
        callback(null, pathStorage) //error y destination
    },
    filename:function(req, file, callback){ //Sobreescribimos o renombramos
        //Tienen extensión jpg, pdf, mp4
        const ext = file.originalname.split(".").pop() //el último valor
        const filename = "file-"+Date.now()+"."+ext
        callback(null, filename)
    }
}) //Middleware entre la ruta y el controlador
//hasta aquí

userRouter.use(express.json());

userRouter.get('/', getItems);

userRouter.post('/register', validatorRegister ,createItem);

userRouter.post('/validate', validatorCodigo ,validateItem);

userRouter.post('/login', validatorLogin ,loginItem);

userRouter.put('/actualizarDatosPersonales', validatorDatosPersonales ,updateDatosPersonales);

userRouter.put('/actualizarDatosCompany', validatorDatosCompany ,updateDatosCompany);

userRouter.get('/porJWT', getPorJWT)

userRouter.delete('/deleteUser', deleteUser);

userRouter.put('/recuperarPassword',recuperarPassword);

userRouter.put('/validarRecuperacion', validatorCodigo , validarRecuperacion);

userRouter.put('/restablecerPassword',restablecerPassword);

userRouter.post('/invitar', validarGuest, invitarGuest);

userRouter.post("/logo", uploadMiddleware.single("image"), uploadLogo);


module.exports = userRouter;