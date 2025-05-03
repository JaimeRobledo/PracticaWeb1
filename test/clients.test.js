
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const  clientModel  = require('../models/clients.js');
const userModel = require('../models/users.js');


const api = supertest(app);

let token;
let userId;
let clienteId;

jest.setTimeout(30000);

beforeAll(async () => {
    await dbConnect();
    await clientModel.deleteMany({});
    await userModel.deleteMany({});

  const user = await userModel.create({
    email: 'testcliente@correo.es',
    password: 'Test1234*',
    role: ['user'],
    estado: true
  })

  userId = user._id
  token = tokenSign(user)
})

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
})

describe('Client endpoints', () => {
    describe('POST /api/clients/crearCliente', () => {
        it('Debe crear un cliente correctamente', async () => {
          const res = await api
            .post('/api/clients/crearCliente')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
            .expect(201);
    
          expect(res.body.cliente.nombre).toBe('Cliente test');
          clienteId = res.body.cliente._id;
        });
      });
    
      describe('GET /api/clients/listarClientes', () => {
        it('Debe listar al menos un cliente', async () => {
          const res = await api
            .get('/api/clients/listarClientes')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.length).toBeGreaterThan(0);
        });
      });
    
      describe('GET /api/clients/encontrarCliente/:id', () => {
        it('Debe devolver el cliente por ID', async () => {
          const res = await api
            .get(`/api/clients/encontrarCliente/${clienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body._id).toBe(clienteId);
        });
      });
    
      describe('PUT /api/clients/actualizarCliente/:id', () => {
        it('Debe actualizar correctamente los datos del cliente', async () => {
          const res = await api
            .put(`/api/clients/actualizarCliente/${clienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Cliente Modificado',
                cif: '98765432B',
                address: {
                    street: "Felipe V",
                    number: 82,
                    postal: 28936,
                    city: "Móstoles",
                    province: "Madrid"
                },
                usuarioId: userId
            })
            .expect(200);
    
          expect(res.body.cliente.nombre).toBe('Cliente Modificado');
        });
      });
    
      describe('DELETE /api/clients/borrarCliente/:id?soft=true', () => {
        it('Debe archivar (soft delete) el cliente', async () => {
          const res = await api
            .delete(`/api/clients/borrarCliente/${clienteId}?soft=true`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('desactivado');
        });
      });
    
      describe('GET /api/clients/listarArchivados', () => {
        it('Debe listar clientes archivados', async () => {
          const res = await api
            .get('/api/clients/listarArchivados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body[0]._id).toBe(clienteId);
        });
      });
    
      describe('PATCH /api/clients/recuperarCliente/:id', () => {
        it('Debe recuperar un cliente archivado', async () => {
          const res = await api
            .patch(`/api/clients/recuperarCliente/${clienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('recuperado');
        });
      });
    
      describe('DELETE /api/clients/borrarCliente/:id?soft=false', () => {
        it('Debe eliminar permanentemente (hard delete) el cliente', async () => {
          const res = await api
            .delete(`/api/clients/borrarCliente/${clienteId}?soft=false`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          expect(res.body.message).toContain('eliminado');
        });
      });
    
      describe('GET /api/clients/encontrarCliente/:id después del hard delete', () => {
        it('Debe devolver 404 al buscar cliente eliminado', async () => {
          await api
            .get(`/api/clients/encontrarCliente/${clienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        });
      });
    
      describe('GET /api/clients/listarArchivados después del hard delete', () => {
        it('Cliente eliminado no debe aparecer en archivados', async () => {
          const archivedRes = await api
            .get('/api/clients/listarArchivados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
    
          const clienteEliminado = archivedRes.body.find(c => c._id === clienteId);
          expect(clienteEliminado).toBeUndefined();
        });
      });
});