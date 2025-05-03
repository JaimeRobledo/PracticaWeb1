
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const  clientModel  = require('../models/clients.js');
const userModel = require('../models/users.js');
const projectModel = require('../models/projects.js');


const api = supertest(app);

let token;
let userId;
let clienteId;
let projectId;

jest.setTimeout(30000);

beforeAll(async () => {
    await dbConnect();
    await projectModel.deleteMany({});
    await clientModel.deleteMany({});
    await userModel.deleteMany({});

    const user = await userModel.create({
        email: 'testcliente@correo.es',
        password: 'Test1234*',
        role: ['user'],
        estado: true
    })

    // Crear un cliente para el usuario
    userId = user._id
    token = tokenSign(user)

    const cliente = await clientModel.create({
        nombre: 'Cliente test',
        cif: '12345678A',
        "address": {
            "street": "Felipe V",
            "number": 82,
            "postal": 28936,
            "city": "Móstoles",
            "province": "Madrid"
        },
        usuarioId: userId
    })

    clienteId = cliente._id;
    
})

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
})

describe('Project endpoints', () => {
    describe('POST /api/projects/crearProyecto', () => {
        it('Debe crear un proyecto correctamente', async () => {
          const res = await api
            .post('/api/projects/crearProyecto')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Proyecto test',
                codigo: "69696969NCKTAR",
                projectCode: "1234567870",
                fechaInicio: "2023-10-01",
                fechaFinal: "2023-10-31",
                notes: "Proyecto de prueba",
                address: {
                    street: "Felipe V",
                    number: 82,
                    postal: 28936,
                    city: "Móstoles",
                    province: "Madrid"
                },
                usuarioId: userId,
                clientId: clienteId
            })
            .expect(201);
    
          expect(res.body.proyecto.nombre).toBe('Proyecto test');
          projectId = res.body.proyecto._id;
        });
      });
    
      describe('GET /api/projects/listarProyectos', () => {
        it('Debe listar al menos un proyecto', async () => {
          const res = await api
            .get('/api/projects/listarProyectos')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.length).toBeGreaterThan(0);
        });
      });
    
      describe('GET /api/projects/encontrarProyecto/:id', () => {
        it('Debe devolver el proyecto por ID', async () => {
          const res = await api
            .get(`/api/projects/encontrarProyecto/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body._id).toBe(projectId);
        });
      });
    
      describe('PUT /api/projects/actualizarProyecto/:id', () => {
        it('Debe actualizar correctamente los datos del proyecto', async () => {
          const res = await api
            .put(`/api/projects/actualizarProyecto/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Proyecto Modificado',
                codigo: "69696969NCKTAR",
                projectCode: "1234567870",
                fechaInicio: "2023-10-07",
                fechaFinal: "2023-11-31",
                notes: "Proyecto de prueba modificado",
                address: {
                    street: "Felipe V",
                    number: 82,
                    postal: 28936,
                    city: "Móstoles",
                    province: "Madrid"
                },
                usuarioId: userId,
                clientId: clienteId
            })
            .expect(200);
    
          expect(res.body.proyecto.nombre).toBe('Proyecto Modificado');
        });
      });
    
      describe('DELETE /api/projects/borrarProyecto/:id?soft=true', () => {
        it('Debe archivar (soft delete) el proyecto', async () => {
          const res = await api
            .delete(`/api/projects/borrarProyecto/${projectId}?soft=true`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('desactivado');
        });
      });
    
      describe('GET /api/projects/listarArchivados', () => {
        it('Debe listar proyectos archivados', async () => {
          const res = await api
            .get('/api/projects/listarArchivados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body[0]._id).toBe(projectId);
        });
      });
    
      describe('PATCH /api/projects/recuperarProyecto/:id', () => {
        it('Debe recuperar un proyecto archivado', async () => {
          const res = await api
            .patch(`/api/projects/recuperarProyecto/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('recuperado');
        });
      });
    
      describe('DELETE /api/projects/borrarProyecto/:id?soft=false', () => {
        it('Debe eliminar permanentemente (hard delete) el proyecto', async () => {
          const res = await api
            .delete(`/api/projects/borrarProyecto/${projectId}?soft=false`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('eliminado');
        });
      });
    
      describe('GET /api/projects/encontrarProyecto/:id después del hard delete', () => {
        it('Debe devolver 404 al buscar proyecto eliminado', async () => {
          await api
            .get(`/api/projects/encontrarProyecto/${projectId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        });
      });
    
      describe('GET /api/projects/listarArchivados después del hard delete', () => {
        it('Proyecto eliminado no debe aparecer en archivados', async () => {
          const archivedRes = await api
            .get('/api/projects/listarArchivados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          const proyectoEliminado = archivedRes.body.find(c => c._id === projectId);
          expect(proyectoEliminado).toBeUndefined();
        });
      });
});