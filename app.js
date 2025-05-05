require('dotenv').config();
const express = require("express")
const cors = require("cors")
const dbConnect = require('./config/mongo.js')
const app = express()
//Le decimos a la app de express() que use cors para evitar el error Cross-Domain (XD)
app.use(cors())
app.use(express.json())
const swaggerUi = require("swagger-ui-express")
const swaggerSpecs = require("./docs/swagger.js")
const morganBody = require("morgan-body")
const {IncomingWebhook} = require("@slack/webhook")
app.use(express.static("storage")) // http://localhost:3000/file.jpg
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log("Servidor escuchando en el puerto " + port)
})
dbConnect()

app.use("/api-documentacion",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs)
)

app.use("/api", require("./router"))

const loggerStream = require("./utils/handleLogger.js")

morganBody(app, {
    noColors: true,
    skip: function(req, res) {
        return res.statusCode < 400
    },
    stream: loggerStream
})

module.exports = {app, server};