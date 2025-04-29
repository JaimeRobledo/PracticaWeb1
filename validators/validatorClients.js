const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorCrearCliente = [
    

    (req, res, next) => {
        return validateResults(req, res, next)
    }

]

module.exports = {}