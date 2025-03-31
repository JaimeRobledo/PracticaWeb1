const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorRegister = [

    check("email").exists().notEmpty().isEmail(),
    check("password").exists().notEmpty().isLength( {min:8, max: 16} ),
    check("role").optional().notEmpty().isIn(["admin", "user"]),
    
    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

const validatorCodigo=[
    check("codigo_validacion").exists().notEmpty().isLength( {min:6, max: 6} ).isNumeric(),
    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

const validatorLogin= [

    check("email").exists().notEmpty().isEmail(),
    check("password").exists().notEmpty().isLength( {min:8, max: 16} ),
    
    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

const validatorDatosPersonales = [

    check("nombre").exists().notEmpty(),
    check("apellidos").exists().notEmpty(),
    check("nif").exists().notEmpty().isLength( {min:9, max: 9} ).isAlphanumeric(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

const validatorDatosCompany = [
    check("company.name").exists().notEmpty(),
    check("company.cif").exists().notEmpty().isLength( {min:9, max: 9} ).isAlphanumeric(),
    check("company.address").exists().notEmpty(),
    check("company.autonomo").optional().notEmpty().isBoolean(),


    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

module.exports = { validatorRegister, validatorCodigo, validatorLogin, validatorDatosPersonales, validatorDatosCompany }