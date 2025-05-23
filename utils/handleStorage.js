const multer = require("multer")
const storage = multer.diskStorage({
destination:function(req, file, callback){ //Pasan argumentos automáticamente
const pathStorage = __dirname+"/../AlmacenLogos"
callback(null, pathStorage) //error y destination
},
filename:function(req, file, callback){ //Sobreescribimos o renombramos
//Tienen extensión jpg, pdf, mp4
const ext = file.originalname.split(".").pop() //el último valor
const filename = "file-"+Date.now()+"."+ext
callback(null, filename)
}
})

const uploadMiddleware = multer({storage, limits: {fileSize: 5*1024*1024}}) //Middleware entre la ruta y el controlador
const memory = multer.memoryStorage()
const uploadMiddlewareMemory = multer({storage: memory, limits: {fileSize: 5*1024*1024}})
module.exports = { uploadMiddleware, uploadMiddlewareMemory }