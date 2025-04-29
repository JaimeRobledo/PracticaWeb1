require('dotenv').config();
const express = require("express")
const cors = require("cors")
const userRouter = require('./router/users.js')
const dbConnect = require('./config/mongo')
const app = express()
//Le decimos a la app de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors())
app.use(express.json())
app.use('/api/users', userRouter)
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger")
app.use(express.static("storage")) // http://localhost:3000/file.jpg
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port)
})
dbConnect()

/*app.use("/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
    )
    app.use("/api", require("./router"))

module.exports = {app, server};*/