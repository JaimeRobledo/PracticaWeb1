const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API - Digitalización de Albaranes",
      version: "1.0.0",
      description:
        "API REST para la gestión de usuarios, clientes, proyectos y albaranes. Documentada con Swagger.",
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
        url: "http://localhost:3000"
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
      },
      schemas: {
        user: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jaime Robledo" },
            email: { type: "string", example: "jaime@gmail.com" },
            password: { type: "string", example: "12345678" }
          }
        },
        login: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "jaime@gmail.com" },
            password: { type: "string", example: "12345678" }
          }
        },
        cliente: {
          type: "object",
          required: ["nombre", "email"],
          properties: {
            nombre: { type: "string", example: "Cliente S.A." },
            email: { type: "string", example: "cliente@gmail.com" },
            telefono: { type: "string", example: "+34 600 123 456" },
            direccion: { type: "string", example: "Calle Falsa 123, Madrid" }
          }
        },
        proyecto: {
          type: "object",
          required: ["nombre", "clienteId"],
          properties: {
            nombre: { type: "string", example: "Instalación eléctrica" },
            descripcion: { type: "string", example: "Reforma integral de red" },
            clienteId: { type: "string", example: "661f0c872b547781f2aa2e8c" }
          }
        },
        albaran: {
          type: "object",
          required: ["proyectoId", "fecha", "concepto"],
          properties: {
            proyectoId: { type: "string", example: "661f0c872b547781f2aa2e8c" },
            fecha: { type: "string", format: "date", example: "2024-04-29" },
            concepto: { type: "string", example: "Revisión de cableado" },
            precio: { type: "number", example: 150.75 },
            firmado: { type: "boolean", example: false }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./router/*.js"], 
};

module.exports = swaggerJsdoc(options);
