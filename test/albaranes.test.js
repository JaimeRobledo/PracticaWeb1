
const pinataSpy =jest.spyOn(require('../utils/handleUploadIPFS.js'), 'uploadToPinata')
  .mockResolvedValue({ IpfsHash: 'test-ipfs-hash' });

const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');
const  clientModel  = require('../models/clients.js');
const userModel = require('../models/users.js');
const projectModel = require('../models/projects.js');
const albaranModel = require('../models/albaranes.js');


const api = supertest(app);

let token;
let userId;
let clienteId;
let projectId;
let albaranId;

jest.setTimeout(30000);

// Mock fetch para getPdfAlbaran
global.fetch = jest.fn(() => 
    Promise.resolve({
      buffer: () => Promise.resolve(Buffer.from('test signature data')),
    })
  );

beforeAll(async () => {
    await dbConnect();
    await albaranModel.deleteMany({});
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

    // Crear un proyecto para el cliente
    const proyecto = await projectModel.create({
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
    
    projectId = proyecto._id;
})

afterAll(async () => {
    jest.restoreAllMocks();

    server.close();
    await mongoose.connection.close();
})

describe('Albaranes endpoints', () => {
    describe('POST /api/albaranes/crearAlbaran', () => {
      it('Debe crear un albarán correctamente', async () => {

        const res = await api
          .post('/api/albaranes/crearAlbaran')
          .set('Authorization', `Bearer ${token}`)
          .send({
            clientId: clienteId,
            projectId: projectId,
            format: "hours",
            hours: 8,
            descriptionId: "6812590fa1c02f5cdd12bf95",
            description: "Desarrollo de API REST",
            workdate: "2024-05-01"
          })
          .expect(201);
  
        expect(res.body.data).toBeDefined();
        expect(res.body.data.format).toBe('hours');
        expect(res.body.data.hours).toBe(8);
        
        
        albaranId = res.body.data._id;
        
      });
  
      it('No debe permitir crear un albarán duplicado', async () => {
        const res = await api
          .post('/api/albaranes/crearAlbaran')
          .set('Authorization', `Bearer ${token}`)
          .send({
            clientId: clienteId,
            projectId: projectId,
            format: "hours",
            hours: 8,
            descriptionId: "6812590fa1c02f5cdd12bf95",
            description: "Desarrollo de API REST",
            workdate: "2024-05-01"
          })
          .expect(409);
  
        expect(res.body.error).toContain('ya existente');
      });
  
      it('Debe crear un albarán con formato material', async () => {
        const res = await api
          .post('/api/albaranes/crearAlbaran')
          .set('Authorization', `Bearer ${token}`)
          .send({
            clientId: clienteId,
            projectId: projectId,
            format: "material",
            quantity: 10,
            descriptionId: "6812590fa1c02f5cdd12bf96",
            description: "Licencias de software",
            workdate: "2024-05-02"
          })
          .expect(201);
  
        expect(res.body.data).toBeDefined();
        expect(res.body.data.format).toBe('material');
        expect(res.body.data.quantity).toBe(10);
      });
    });
  
    describe('GET /api/albaranes/getAlbaranes', () => {
      it('Debe listar todos los albaranes del usuario', async () => {
        const res = await api
          .get('/api/albaranes/getAlbaranes')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
  
        if (res.body.data.length > 0) {
            expect(res.body.data[0].clientId).toBeDefined();
        }
      });
  
      it('Debe filtrar albaranes por projectId', async () => {
        const res = await api
          .get(`/api/albaranes/getAlbaranes?projectId=${projectId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
  
        if (res.body.data.length > 0) {
            expect(res.body.data[0].projectId.toString()).toBe(projectId.toString());
        }
      });
    });
  
    describe('GET /api/albaranes/getAlbaran/:id', () => {
      it('Debe obtener un albarán específico por ID', async () => {
        const res = await api
          .get(`/api/albaranes/getAlbaran/${albaranId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
  
        expect(res.body.data._id).toBe(albaranId);
        expect(res.body.data.clientId).toBeDefined();
        expect(res.body.data.projectId).toBeDefined();
        expect(res.body.data.userId).toBeDefined();
      });
  
      it('Debe devolver 404 para un ID inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await api
          .get(`/api/albaranes/getAlbaran/${fakeId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
  
        expect(res.body.error).toContain('no encontrado');
      });
    });
  
    describe('GET /api/albaranes/getPdfAlbaran/:id', () => {
      it('Debe generar un PDF para un albarán existente', async () => {
        const res = await api
          .get(`/api/albaranes/getPdfAlbaran/${albaranId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
  
        expect(res.header['content-type']).toBe('application/pdf');
        expect(res.header['content-disposition']).toContain(`albaran_${albaranId}.pdf`);
      });
  
      it('Debe devolver 404 al intentar generar PDF de albarán inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await api
          .get(`/api/albaranes/getPdfAlbaran/${fakeId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
  
        expect(res.body.error).toContain('no encontrado');
      });
    });
  
    describe('POST /api/albaranes/firmarAlbaran/:id', () => {
      it('Debe firmar un albarán correctamente', async () => {
        // Crear un buffer de prueba para simular una imagen de firma
        const signatureBuffer = Buffer.from('test signature data');
        
        const res = await api
          .post(`/api/albaranes/firmarAlbaran/${albaranId}`)
          .set('Authorization', `Bearer ${token}`)
          .attach('image', signatureBuffer, './firma.png')
          .expect(200);
  
        expect(res.body.message).toBe('Albarán firmado correctamente: ');
        expect(res.body.data).toBeDefined();
        
        // Verificar que el albarán está marcado como firmado
        const albaranActualizado = await api
          .get(`/api/albaranes/getAlbaran/${albaranId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
          
        expect(albaranActualizado.body.data.signed).toBe(true);
        expect(albaranActualizado.body.data.sign).toContain('ipfs');
      });
  
      it('Debe devolver 404 al intentar firmar un albarán inexistente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const signatureBuffer = Buffer.from('test signature data');
        
        const res = await api
          .post(`/api/albaranes/firmarAlbaran/${fakeId}`)
          .set('Authorization', `Bearer ${token}`)
          .attach('image', signatureBuffer, 'signature.png')
          .expect(404);
  
        expect(res.body.error).toContain('no encontrado');
      });
    });
  
    describe('DELETE /api/albaranes/borrarAlbaran/:id?soft=true', () => {
      let albaranNoFirmadoId;
      
      // Crear un nuevo albarán sin firmar para poder probarlo
      beforeAll(async () => {
        const nuevoAlbaran = await api
          .post('/api/albaranes/crearAlbaran')
          .set('Authorization', `Bearer ${token}`)
          .send({
            clientId: clienteId,
            projectId: projectId,
            format: "hours",
            hours: 4,
            descriptionId: "6812590fa1c02f5cdd12bf97",
            description: "Albarán para borrar",
            workdate: "2024-05-03"
          })
          .expect(201);
          
        albaranNoFirmadoId = nuevoAlbaran.body.data._id;
      });
      
      it('Debe borrar (soft delete) un albarán no firmado', async () => {
        const res = await api
          .delete(`/api/albaranes/borrarAlbaran/${albaranNoFirmadoId}?soft=true`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
        console.log("soft?----------------------------",res.query)
        expect(res.body.message).toContain('desactivado correctamente');
      });
  
      it('No debe permitir borrar un albarán firmado', async () => {
        // Intentar borrar el albarán que ya firmamos
        const res = await api
          .delete(`/api/albaranes/borrarAlbaran/${albaranId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
  
        expect(res.body.error).toContain('firmado y no se puede borrar');
      });
    });
  });