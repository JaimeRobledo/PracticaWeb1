const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { encrypt } = require('../utils/handlePassword.js');
const { tokenSign } = require('../utils/handleJwt');
const { userModel } = require('../models/users.js');

const api = supertest(app);

const initialUser = {
  name: "Marcos",
  email: "marcos@correo.es",
  password: "mipassword"
};

let token;

beforeAll(async () => {
  await new Promise(resolve => mongoose.connection.once('connected', resolve));
  await userModel.deleteMany({});

  // Crear usuario cifrado manualmente
  const hashedPassword = await encrypt(initialUser.password);
  const user = await userModel.create({ ...initialUser, password: hashedPassword });

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
        name: "Ana",
        email: "ana@example.com",
        password: "123456"
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', 'ana@example.com');
  });

  it('no debería permitir registrar un email ya existente', async () => {
    const res = await api.post('/api/users/register')
      .send({
        name: "Repetido",
        email: initialUser.email,
        password: "otro"
      })
      .expect(400); // o el código que uses para errores de validación

    expect(res.body).toHaveProperty('error');
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
      .expect(401); // o el código que uses

    expect(res.body).toHaveProperty('error');
  });

  it('debería devolver todos los usuarios (autenticado)', async () => {
    const res = await api.get('/api/users')
      .auth(token, { type: 'bearer' })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

});
