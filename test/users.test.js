const emailSpy = jest.spyOn(require('../utils/handleEmail.js'), 'sendEmail')
  .mockResolvedValue({ messageId: 'test-message-id' });

const pinataSpy =jest.spyOn(require('../utils/handleUploadIPFS.js'), 'uploadToPinata')
  .mockResolvedValue({ IpfsHash: 'test-ipfs-hash' });

const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const  userModel  = require('../models/users.js');
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');
const { sendEmail } = require('../utils/handleEmail.js');
const path = require('path');


const api = supertest(app);

const initialUser = {
  nombre: "Test User",
  apellidos: "Test Apellidos",
  nif: "12345678Z",
  email: "test@correo.es",
  password: "0123456789",
  role: "user"
};

const initialAdmin = {
  nombre: "Admin User",
  apellidos: "Admin Apellidos",
  nif: "87654321X",
  email: "admin@correo.es",
  password: "0123456789",
  role: "admin"
};

let userToken;
let adminToken;
let validationCode;
let recoveryCode;

jest.setTimeout(30000);

beforeAll(async () => {
  await dbConnect();
  await userModel.deleteMany({});

  // Espiar el método create del modelo de usuario
  const createSpy = jest.spyOn(userModel, 'create');

  // Crear usuario administrador cifrado
  const hashedAdminPassword = await encrypt(initialAdmin.password);
  const admin = await userModel.create({ 
    ...initialAdmin, 
    password: hashedAdminPassword, 
    estado: true 
  });

  // Crear usuario normal cifrado
  const hashedUserPassword = await encrypt(initialUser.password);
  validationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await userModel.create({ 
    ...initialUser, 
    password: hashedUserPassword, 
    estado: true,
    codigo_validacion: validationCode
  });

  // Verificar que el método create fue llamado 2 veces
  expect(createSpy).toHaveBeenCalledTimes(2);
  
  admin.set("password", undefined, { strict: false });
  user.set("password", undefined, { strict: false });
  
  adminToken = await tokenSign(admin);
  userToken = await tokenSign(user);
  
  // Restaurar el método original
  createSpy.mockRestore();
});

afterAll(async () => {
  // Restaurar todos los mocks y spies
  jest.restoreAllMocks();
  
  server.close();
  await mongoose.connection.close();
});

describe('User endpoints', () => {
  describe('GET /api/users', () => {
    it('deberia retornar los user para users validados como admin', async () => {
      const res = await api.get('/api/users')
        .auth(adminToken, { type: 'bearer' })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/users/register', () => {
    it('deberia registrar un nuevo user', async () => {
      const newUser = {
        email: "newuser@correo.es",
        password: "0123456789",
        role: "user"
      };

      // Verificar que el método sendEmail sea llamado

      const res = await api.post('/api/users/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      expect(res.body).toHaveProperty('email', newUser.email);
      expect(res.body).toHaveProperty('role', [newUser.role]);
      expect(res.body).toHaveProperty('estado', false);
      expect(res.body).toHaveProperty('token');
      
      // Verificar que se haya enviado un email
      expect(emailSpy).toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Código de validación",
          to: newUser.email
        })
      );
    });

    it('no deberia permitir registrar un email existente', async () => {
      const res = await api.post('/api/users/register')
        .send({
          email: initialUser.email,
          password: "0123456789",
          role: "user"
        })
        .expect(409);

      expect(res.body).toHaveProperty('message', 'Usuario ya existe');
    });

    it('deberia fallar por datos invalidos', async () => {
      const res = await api.post('/api/users/register')
        .send({
          email: "invalid-email",
          password: "123" 
        })
        .expect(401);

      expect(res.body).toHaveProperty('errors');
    });
  });
  
  describe('POST /api/users/validate', () => {
    it('deberia validar a el user con codigo correcto', async () => {
      const newUser = {
        email: "tovalidate@correo.es",
        password: "0123456789",
        role: "user"
      };
      
      const registerRes = await api.post('/api/users/register')
        .send(newUser);
      
      const validateRes = await api.post('/api/users/validate')
        .auth(registerRes.body.token, { type: 'bearer' })
        .send({
          codigo_validacion: registerRes.body.codigo_validacion || '123456'
        })
        .expect(201);
        console.log(registerRes.body) //---------------------------------------------------------------------------------------revisar

      expect(validateRes.body).toHaveProperty('message', 'Usuario validado correctamente');
    });
    
    it('deberia fallar para el user con codigo incorrecto', async () => {
      const res = await api.post('/api/users/validate')
        .auth(userToken, { type: 'bearer' })
        .send({
          codigo_validacion: '000000' 
        })
        .expect(400);
        
      expect(res.body).toHaveProperty('message', 'Código de validación incorrecto');//---------------------------------------------------------------------------------------revisar
    });
  });

  describe('POST /api/users/login', () => {
    it('deberia hacer bien el login', async () => {
      const res = await api.post('/api/users/login')
        .send({
          email: initialUser.email,
          password: initialUser.password
        })
        .expect(200)
        .expect('Content-Type', /application\/json/);
        
      expect(res.body).toHaveProperty('message', 'Usuario logueado correctamente');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });
    
    it('deberia fallar con password incorrecta', async () => {
      const res = await api.post('/api/users/login')
        .send({
          email: initialUser.email,
          password: 'wrong_password'
        })
        .expect(401);
        
      expect(res.body).toHaveProperty('message', 'Contraseña incorrecta');
    });
    
    it('deberia fallar con un email que no existe', async () => {
      const res = await api.post('/api/users/login')
        .send({
          email: 'nonexistent@correo.es',
          password: initialUser.password
        })
        .expect(404);
        
      expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });

  describe('PUT /api/users/actualizarDatosPersonales', () => {
    it('deberia actualizar datos personales', async () => {
      const newData = {
        nombre: "Updated Name",
        apellidos: "Updated Apellidos",
        nif: "87654321Z"
      };
      
      const res = await api.put('/api/users/actualizarDatosPersonales')
        .auth(userToken, { type: 'bearer' })
        .send(newData)
        .expect(201);           
        
      expect(res.body).toHaveProperty('message', 'Usuario actualizado correctamente:');
      expect(res.body).toHaveProperty('nombre', newData.nombre);
      expect(res.body).toHaveProperty('apellidos', newData.apellidos);
      expect(res.body).toHaveProperty('nif', newData.nif);
    });
    
    it('deberia fallar con datos invalidos', async () => {
      const res = await api.put('/api/users/actualizarDatosPersonales')
        .auth(userToken, { type: 'bearer' })
        .send({
          nombre: "", 
          apellidos: "Updated Apellidos",
          nif: "87654321Z"
        })
        .expect(401);
        
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/users/actualizarDatosCompany', () => {
    it('deberia actualizar datos del autonomo', async () => {
      const companyData = {
        autonomo: true,
        company: {
          address: "Calle Test 123"
        }
      };
      
      const res = await api.put('/api/users/actualizarDatosCompany')
        .auth(userToken, { type: 'bearer' })
        .send(companyData)
        .expect(201);  //----------------------------------------------------------------------------------------revisar
        
      expect(res.body).toHaveProperty('message', 'Usuario actualizado correctamente:');
      expect(res.body.company).toHaveProperty('address', companyData.company.address);
    });
    
    it('deberia actualizar datos de la compañia', async () => {
      const companyData = {
        autonomo: false,
        company: {
          name: "Test Company",
          cif: "B12345678",
          address: "Calle Test 123"
        }
      };
      
      const res = await api.put('/api/users/actualizarDatosCompany')
        .auth(userToken, { type: 'bearer' })
        .send(companyData)
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario actualizado correctamente:');
      expect(res.body.company).toHaveProperty('name', companyData.company.name);
      expect(res.body.company).toHaveProperty('cif', companyData.company.cif);
      expect(res.body.company).toHaveProperty('address', companyData.company.address);
    });
  });

  describe('GET /api/users/porJWT', () => {
    it('deberia devolver datos relacionados con el JWT', async () => {
      const res = await api.get('/api/users/porJWT')
        .auth(userToken, { type: 'bearer' })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario encontrado correctamente:');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', initialUser.email);
    });
    
    it('deberia fallar con token invalido', async () => {
      const res = await api.get('/api/users/porJWT')
        .auth('invalid-token', { type: 'bearer' })
        .expect(401);
        
    });
  });

  describe('PUT /api/users/recuperarPassword', () => {
    it('deberia mandar codigo de validacion al email', async () => {
      // Mock the email sending to capture the code
      let capturedCode;
      const emailSpy = jest.spyOn(require('../utils/handleEmail.js'), 'sendEmail')
        .mockImplementation((emailData) => {
          // Extract code from the text
          const codeMatch = emailData.text.match(/\d{6}/);
          if (codeMatch) capturedCode = codeMatch[0];
          return Promise.resolve({ messageId: 'test-message-id' });
        });
      
      const res = await api.put('/api/users/recuperarPassword')
        .send({
          email: initialUser.email
        })
        .expect(200);
        
      expect(res.body).toHaveProperty('message', 'Código de recuperación enviado a tu email.');
      expect(res.body).toHaveProperty('token');
      expect(emailSpy).toHaveBeenCalled();
      
      // Store this for the next test
      global.recoveryToken = res.body.token;
      global.recoveryCode = capturedCode;
      
      // Restore original implementation
      emailSpy.mockRestore();
    });
    
    it('deberia fallar con email inexistente', async () => {
      const res = await api.put('/api/users/recuperarPassword')
        .send({
          email: 'nonexistent@correo.es'
        })
        .expect(404);
        
      expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });

  describe('PUT /api/users/validarRecuperacion', () => {
    it('deberia validar codigo de validacion', async () => {
     
      const recoveryRes = await api.put('/api/users/recuperarPassword')
        .send({
          email: initialUser.email
        });
        
      const recoveryToken = recoveryRes.body.token;
      const code = recoveryRes.body.codigo_validacion;
      
      const res = await api.put('/api/users/validarRecuperacion')
        .auth(recoveryToken, { type: 'bearer' })
        .send({
          codigo_validacion: code
        })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Restablecimiento de password validado correctamente');
    });
    
    it('deberia fallar con codigo de validacion incorrecto', async () => {
      const res = await api.put('/api/users/validarRecuperacion')
        .auth(userToken, { type: 'bearer' })
        .send({
          codigo_validacion: '000000' 
        })
        .expect(400);
        
      expect(res.body).toHaveProperty('message', 'Código de validación incorrecto');
    });
  });

  describe('PUT /api/users/restablecerPassword', () => {
    it('resetea password', async () => {
      const newPassword = "newPassword123";
      
      const res = await api.put('/api/users/restablecerPassword')
        .auth(userToken, { type: 'bearer' })
        .send({
          password: newPassword
        })
        .expect(200);
        
      expect(res.body).toHaveProperty('message', 'Contraseña restablecida correctamente');
      
      const loginRes = await api.post('/api/users/login')
        .send({
          email: initialUser.email,
          password: newPassword
        })
        .expect(200);
        
      expect(loginRes.body).toHaveProperty('message', 'Usuario logueado correctamente');
    });
  });

  describe('POST /api/users/invitar', () => {
    it('deberia invitar a guest de user', async () => {
      const guestEmail = "guest@correo.es";
      
      const res = await api.post('/api/users/invitar')
        .auth(userToken, { type: 'bearer' })
        .send({
          email: guestEmail
        })
        .expect(201);
        
      expect(res.body).toHaveProperty('email', guestEmail);
      expect(res.body).toHaveProperty('role', ['guest']);
      expect(res.body).toHaveProperty('estado', false);
    });
    
    it('deberia fallar si el guest ya existe', async () => {
      const guestEmail = "guest@correo.es";
      
      const res = await api.post('/api/users/invitar')
        .auth(userToken, { type: 'bearer' })
        .send({
          email: guestEmail
        })
        .expect(409);
        
      expect(res.body).toHaveProperty('message', 'Guest ya existe');
    });
  });

  describe('POST /api/users/logo', () => {
    it('deberia subir logo', async () => {
      const testImagePath = path.join(__dirname, 'pengu.jpg');
      
      
      const res = await api.post('/api/users/logo')
        .auth(userToken, { type: 'bearer' })
        .attach('image', testImagePath)
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Imagen subida correctamente');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('logo');
      expect(res.body.data.logo).toContain('ipfs');
      
      expect(pinataSpy).toHaveBeenCalled();
      expect(pinataSpy).toHaveBeenCalledWith(
        expect.any(Buffer),  
        expect.any(String)   
      );
    });
  });

  describe('DELETE /api/users/deleteUser', () => {
    it('deberia hacer un soft delete a user', async () => {
      const res = await api.delete('/api/users/deleteUser')
        .auth(userToken, { type: 'bearer' })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario desactivado correctamente:');
    });
    
    it('deberia borrar 100% al user', async () => {
      
      const newUser = {
        email: "todelete@correo.es",
        password: "0123456789",
        role: "user"
      };
      
      const registerRes = await api.post('/api/users/register')
        .send(newUser);
      
      const deleteRes = await api.delete('/api/users/deleteUser?soft=false')
        .auth(registerRes.body.token, { type: 'bearer' })
        .expect(201);
        
      expect(deleteRes.body).toHaveProperty('message', 'Usuario eliminado correctamente:');
    });
  });
});