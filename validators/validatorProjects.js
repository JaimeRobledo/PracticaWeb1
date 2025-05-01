const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorCrearProyecto = [

    check("nombre").exists().notEmpty(),
    check("codigo").exists().notEmpty(),
    check("projectCode").exists().notEmpty(),
    check("fechaInicio").exists().notEmpty(),
    check("fechaFinal").exists().notEmpty(),
    check("notes").exists().notEmpty(),
    check("address").exists().notEmpty(),
    check("address.street").exists().notEmpty(),
    check("address.number").exists().notEmpty(),
    check("address.postal").exists().notEmpty(),
    check("address.city").exists().notEmpty(),
    check("address.province").exists().notEmpty(),
    check("usuarioId").exists().notEmpty(),
    check("clientId").exists().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

const validatorUpdateProyecto = [

    check("nombre").exists().notEmpty(),
    check("codigo").exists().notEmpty(),
    check("projectCode").exists().notEmpty(),
    check("fechaInicio").exists().notEmpty(),
    check("fechaFinal").exists().notEmpty(),
    check("notes").exists().notEmpty(),
    check("address").exists().notEmpty(),
    check("address.street").exists().notEmpty(),
    check("address.number").exists().notEmpty(),
    check("address.postal").exists().notEmpty(),
    check("address.city").exists().notEmpty(),
    check("address.province").exists().notEmpty(),
    check("usuarioId").exists().notEmpty(),
    check("clientId").exists().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

module.exports = {validatorCrearProyecto, validatorUpdateProyecto}