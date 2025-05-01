const projectModel = require('../models/clients.js')
const { matchedData } = require("express-validator")
const {encrypt, compare} = require('../utils/validatePassword.js')
const {tokenSign, verifyToken} = require('../utils/encargarseJwt.js')
const { handleHttpError } = require('../utils/handleError.js');

module.exports = {crearProyecto, updateProyecto, listarProyectos, encontrarProyecto, deleteProyecto, listarArchivados, recuperarProyecto}