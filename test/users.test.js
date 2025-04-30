const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const dbConnect = require('../config/mongo.js')
const { encrypt } = require('../utils/validatePassword.js');
const { tokenSign } = require('../utils/encargarseJwt');
const  userModel  = require('../models/users.js');

const api = supertest(app);

const initialUser = {
  name: "Jaime",
  email: "jaime@correo.es",
  password: "0123456789"
};

let token;

beforeAll(async () => {
  await dbConnect();
  await userModel.deleteMany({});

  // Crear usuario cifrado manualmente
  const hashedPassword = await encrypt(initialUser.password);
  const user = await userModel.create({ ...initialUser, password: hashedPassword, estado: true });

  user.set("password", undefined, { strict: false });
  token = await tokenSign(user, process.env.JWT_SECRET);
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe('Rutas de users', () => {

  it('debería registrar un nuevo usuario', async () => {
    const res = await api.post('/api/users/register')
      .send({
        email: "diego@correo.es",
        password: "0123456789"
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);

      console.log("IMPORTANTE:" , res.body);
    expect(res.body).toHaveProperty('email', 'diego@correo.es');
  });

  it('no debería permitir registrar un email ya existente', async () => {
    const res = await api.post('/api/users/register')
      .send({
        email: "diego@correo.es",
        password: "0123456789"
      })
      .expect(409); 

    expect(res.body).toHaveProperty('message', 'Usuario ya existe');
  });

  it('debería hacer login correctamente', async () => {
    const res = await api.post('/api/users/login')
      .send({
        email: initialUser.email,
        password: initialUser.password
      })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveProperty('token');
  });

  it('debería rechazar login con contraseña incorrecta', async () => {
    const res = await api.post('/api/users/login')
      .send({
        email: initialUser.email,
        password: 'contraseña_incorrecta'
      })
      .expect(401);

    expect(res.body).toHaveProperty('errors');
  });

  it('debería devolver todos los usuarios (autenticado)', async () => {
    const res = await api.get('/api/users')
      .auth(token, { type: 'bearer' })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

});
