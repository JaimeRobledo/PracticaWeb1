const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorCrearCliente = [

    check("nombre").exists().notEmpty(),
    check("cif").exists().notEmpty(),
    check("address").exists().notEmpty(),
    check("address.street").exists().notEmpty(),
    check("address.number").exists().notEmpty(),
    check("address.postal").exists().notEmpty(),
    check("address.city").exists().notEmpty(),
    check("address.province").exists().notEmpty(),
    check("companiaId").optional().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

module.exports = {validatorCrearCliente}