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

module.exports = { validatorRegister }