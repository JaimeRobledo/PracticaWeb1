const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const  userModel  = require('../models/users.js');
const { uploadToPinata } = require('../utils/handleUploadIPFS.js');
const { sendEmail } = require('../utils/handleEmail.js');

const api = supertest(app);

jest.spyOn(require('../utils/handleEmail.js'), 'sendEmail')
  .mockResolvedValue({ messageId: 'test-message-id' });

jest.spyOn(require('../utils/handleUploadIPFS.js'), 'uploadToPinata')
  .mockResolvedValue({ IpfsHash: 'test-ipfs-hash' });

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
  // GET /api/users - Get all users
  describe('GET /api/users', () => {
    it('should return all users when authenticated as admin', async () => {
      const res = await api.get('/api/users')
        .auth(adminToken, { type: 'bearer' })
        .expect(201)
        .expect('Content-Type', /application\/json/);

      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  // POST /api/users/register - Register new user
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: "newuser@correo.es",
        password: "0123456789",
        role: "user"
      };

      // Verificar que el método sendEmail sea llamado
      const emailSpy = require('../utils/handleEmail.js').sendEmail;

      const res = await api.post('/api/users/register')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      expect(res.body).toHaveProperty('email', newUser.email);
      expect(res.body).toHaveProperty('role', newUser.role);
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

    it('should not allow registering with an existing email', async () => {
      const res = await api.post('/api/users/register')
        .send({
          email: initialUser.email,
          password: "0123456789",
          role: "user"
        })
        .expect(409);

      expect(res.body).toHaveProperty('message', 'Usuario ya existe');
    });

    it('should fail with invalid data', async () => {
      const res = await api.post('/api/users/register')
        .send({
          email: "invalid-email",
          password: "123" // too short
        })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });
  });
  
  // POST /api/users/validate - Validate user
  describe('POST /api/users/validate', () => {
    it('should validate a user with correct code', async () => {
      // Create a new user to validate
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
          codigo_validacion: registerRes.body.codigo_validacion || '123456' // Use sent code or fallback
        })
        .expect(201);
      
      expect(validateRes.body).toHaveProperty('message', 'Usuario validado correctamente');
    });
    
    it('should fail with incorrect validation code', async () => {
      const res = await api.post('/api/users/validate')
        .auth(userToken, { type: 'bearer' })
        .send({
          codigo_validacion: '000000' // Wrong code
        })
        .expect(400);
        
      expect(res.body).toHaveProperty('message', 'Código de validación incorrecto');
    });
  });

  // POST /api/users/login - User login
  describe('POST /api/users/login', () => {
    it('should login successfully with correct credentials', async () => {
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
    
    it('should fail with incorrect password', async () => {
      const res = await api.post('/api/users/login')
        .send({
          email: initialUser.email,
          password: 'wrong_password'
        })
        .expect(401);
        
      expect(res.body).toHaveProperty('message', 'Contraseña incorrecta');
    });
    
    it('should fail with non-existent email', async () => {
      const res = await api.post('/api/users/login')
        .send({
          email: 'nonexistent@correo.es',
          password: initialUser.password
        })
        .expect(404);
        
      expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });

  // PUT /api/users/actualizarDatosPersonales - Update personal data
  describe('PUT /api/users/actualizarDatosPersonales', () => {
    it('should update personal data', async () => {
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
    
    it('should fail with invalid data', async () => {
      const res = await api.put('/api/users/actualizarDatosPersonales')
        .auth(userToken, { type: 'bearer' })
        .send({
          nombre: "", // Empty name
          apellidos: "Updated Apellidos",
          nif: "87654321Z"
        })
        .expect(400);
        
      expect(res.body).toHaveProperty('errors');
    });
  });

  // PUT /api/users/actualizarDatosCompany - Update company data
  describe('PUT /api/users/actualizarDatosCompany', () => {
    it('should update company data for autonomous user', async () => {
      const companyData = {
        autonomo: true,
        company: {
          address: "Calle Test 123"
        }
      };
      
      const res = await api.put('/api/users/actualizarDatosCompany')
        .auth(userToken, { type: 'bearer' })
        .send(companyData)
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario actualizado correctamente:');
      expect(res.body.company).toHaveProperty('address', companyData.company.address);
    });
    
    it('should update company data for non-autonomous user', async () => {
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

  // GET /api/users/porJWT - Get user by JWT
  describe('GET /api/users/porJWT', () => {
    it('should return user data based on JWT', async () => {
      const res = await api.get('/api/users/porJWT')
        .auth(userToken, { type: 'bearer' })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario encontrado correctamente:');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', initialUser.email);
    });
    
    it('should fail with invalid token', async () => {
      const res = await api.get('/api/users/porJWT')
        .auth('invalid-token', { type: 'bearer' })
        .expect(401);
        
      expect(res.body).toHaveProperty('errors');
    });
  });

  // PUT /api/users/recuperarPassword - Request password recovery
  describe('PUT /api/users/recuperarPassword', () => {
    it('should send recovery code to email', async () => {
      const res = await api.put('/api/users/recuperarPassword')
        .send({
          email: initialUser.email
        })
        .expect(200);
        
      expect(res.body).toHaveProperty('message', 'Código de recuperación enviado a tu email.');
      expect(res.body).toHaveProperty('codigo_recuperacion');
      expect(res.body).toHaveProperty('token');
      
      // Save recovery code for next test
      recoveryCode = res.body.codigo_recuperacion;
    });
    
    it('should fail with non-existent email', async () => {
      const res = await api.put('/api/users/recuperarPassword')
        .send({
          email: 'nonexistent@correo.es'
        })
        .expect(404);
        
      expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });

  // PUT /api/users/validarRecuperacion - Validate recovery code
  describe('PUT /api/users/validarRecuperacion', () => {
    it('should validate recovery code', async () => {
      // First get recovery code and token
      const recoveryRes = await api.put('/api/users/recuperarPassword')
        .send({
          email: initialUser.email
        });
        
      const recoveryToken = recoveryRes.body.token;
      const code = recoveryRes.body.codigo_recuperacion;
      
      const res = await api.put('/api/users/validarRecuperacion')
        .auth(recoveryToken, { type: 'bearer' })
        .send({
          codigo_validacion: code
        })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Restablecimiento de password validado correctamente');
    });
    
    it('should fail with incorrect recovery code', async () => {
      const res = await api.put('/api/users/validarRecuperacion')
        .auth(userToken, { type: 'bearer' })
        .send({
          codigo_validacion: '000000' // Wrong code
        })
        .expect(400);
        
      expect(res.body).toHaveProperty('message', 'Código de validación incorrecto');
    });
  });

  // PUT /api/users/restablecerPassword - Reset password
  describe('PUT /api/users/restablecerPassword', () => {
    it('should reset password', async () => {
      const newPassword = "newPassword123";
      
      const res = await api.put('/api/users/restablecerPassword')
        .auth(userToken, { type: 'bearer' })
        .send({
          password: newPassword
        })
        .expect(200);
        
      expect(res.body).toHaveProperty('message', 'Contraseña restablecida correctamente');
      
      // Verify can login with new password
      const loginRes = await api.post('/api/users/login')
        .send({
          email: initialUser.email,
          password: newPassword
        })
        .expect(200);
        
      expect(loginRes.body).toHaveProperty('message', 'Usuario logueado correctamente');
    });
  });

  // POST /api/users/invitar - Invite guest user
  describe('POST /api/users/invitar', () => {
    it('should invite a guest user', async () => {
      const guestEmail = "guest@correo.es";
      
      const res = await api.post('/api/users/invitar')
        .auth(userToken, { type: 'bearer' })
        .send({
          email: guestEmail
        })
        .expect(201);
        
      expect(res.body).toHaveProperty('email', guestEmail);
      expect(res.body).toHaveProperty('role', 'guest');
      expect(res.body).toHaveProperty('estado', false);
    });
    
    it('should fail if guest already exists', async () => {
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

  // POST /api/users/logo - Upload company logo
  describe('POST /api/users/logo', () => {
    it('should upload company logo', async () => {
      // Create a test image file
      const testImagePath = path.join(__dirname, 'testLogo.png');
      
      // Espiar la función uploadToPinata
      const pinataSpy = require('../utils/handleUploadIPFS.js').uploadToPinata;
      
      const res = await api.post('/api/users/logo')
        .auth(userToken, { type: 'bearer' })
        .attach('image', testImagePath)
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Imagen subida correctamente');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('logo');
      expect(res.body.data.logo).toContain('ipfs');
      
      // Verificar que se haya llamado a uploadToPinata
      expect(pinataSpy).toHaveBeenCalled();
      expect(pinataSpy).toHaveBeenCalledWith(
        expect.any(Buffer),  // El buffer de la imagen
        expect.any(String)   // El nombre del archivo
      );
    });
  });

  // DELETE /api/users/deleteUser - Delete user (soft delete)
  describe('DELETE /api/users/deleteUser', () => {
    it('should soft delete user', async () => {
      const res = await api.delete('/api/users/deleteUser')
        .auth(userToken, { type: 'bearer' })
        .expect(201);
        
      expect(res.body).toHaveProperty('message', 'Usuario desactivado correctamente:');
    });
    
    it('should permanently delete user', async () => {
      // Create a new user to delete
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