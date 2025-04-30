const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
      openapi: "3.0.3",
      info: {
        title: "API - Digitalización de Albaranes Practica Final",
        version: "0.1.0",
        description:
          "This is a CRUD API application made with Express and documented with Swagger",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "u-tad",
          url: "https://u-tad.com",
          email: "ricardo.palacios@u-tad.com",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
      components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            },
        },
        schemas:{
            
        },
      },
    },
    apis: ["./router/*.js"],
  };
  
module.exports = swaggerJsdoc(options)