const { check } = require("express-validator")
const {validateResults} = require("../utils/encargarseValidacion.js")

const validatorCrearAlbaran = [
    check("clientId").exists().notEmpty().isMongoId(),
    check("projectId").exists().notEmpty().isMongoId(),
    check("format").exists().notEmpty().isIn(['hours', 'material', 'any']),
    check("workdate").exists().notEmpty().isDate(),
    check("company").optional().isString(),
    check("descriptionId").exists().notEmpty().isMongoId(),
    // Validaciones condicionales según el formato
    check("hours").if(check("format").equals("hours")).exists().notEmpty().isNumeric().withMessage("El campo hours es obligatorio cuando el formato es hours"),
    check("quantity").if(check("format").equals("material")).exists().notEmpty().isNumeric().withMessage("El campo quantity es obligatorio cuando el formato es material"),
    // Validaciones para los arrays
    check("multi").optional().isArray(),
    check("materials").optional().isArray(),
    check("concepts").optional().isArray(),
    check("sign").optional().isString(),
    check("pending").optional().isBoolean(),

    (req, res, next) => {
      return validateResults(req, res, next);
    },

]

const validatorUpdateAlbaran = [
    
    check("clientId").optional().isMongoId(),
    check("projectId").optional().isMongoId(),
    check("format").optional().isIn(['hours', 'material', 'any']),
    check("workdate").optional().isDate(),
    check("company").optional().isString(),
    check("descriptionId").optional().isMongoId(),
    check("hours").optional().isNumeric(),
    check("quantity").optional().isNumeric(),
    check("multi").optional().isArray(),
    check("materials").optional().isArray(),
    check("concepts").optional().isArray(),
    check("sign").optional().isString(),
    check("pending").optional().isBoolean(),

    (req, res, next) => {
      return validateResults(req, res, next);
    },

]

module.exports= {validatorCrearAlbaran, validatorUpdateAlbaran}