const {validationResult} = require("express-validator");

const validateResults = (req, res, next) => {
    try {
        validationResult(req).throw()
        return next()

    } catch (error) {
        res.status(401)
        return res.send({errors: error.array()})
    }
}  

module.exports = {validateResults}