const handleHttpError = (res, message, code) => {
    res.status(code).send(message)
   }
   module.exports = { handleHttpError }
   