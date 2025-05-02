const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorMail = [

    check("subject").exists().notEmpty(),
    check("text").exists().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

module.exports = { validatorMail }