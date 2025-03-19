const jwt = require("jsonwebtoken")
const CLAVE_SECRETA = process.env.CLAVE_SECRETA

const tokenSign = (user) => {
    const sign = jwt.sign(
    {
        _id: user._id,
        role: user.role
    },
        CLAVE_SECRETA,
    {
        expiresIn: "2h"
    })
    return sign
}
const verifyToken = (tokenJwt) => {
    try {
        return jwt.verify(tokenJwt, CLAVE_SECRETA)
    }catch(err) {
        console.log(err)
    }
}
module.exports = { tokenSign, verifyToken }