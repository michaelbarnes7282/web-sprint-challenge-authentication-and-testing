const supertest = require('supertest');

const db = require('../database/dbConfig');
const server = require('./server.js');

it('should use the test environment', () => {
    expect(process.env.DB_ENV).toBe('testing');
});

describe('server', () => {
    beforeAll(async () => {
        await db('users').truncate();
    });
    let token;
    const user = {
        username: 'michael',
        password: 'password'       
    }
    const user2 = {
        username: 'zavala',
        password: 'password'
    }
    const user3 = {
        username: 'shaxx',
        password: 'password'
    }
    const nonUser = {
        username: 'noreg',
        password: 'password'
    }

    describe('POST /auth/register', () => {
        it('should return 400 no data if sent no data', () => {
            return supertest(server).post('/api/auth/register')
            .send({})
            .then(res => {
                expect(res.status).toBe(400);
            });
        });

        it('should return 201 OK', () => {
            return supertest(server).post('/api/auth/register')
            .send(user)
            .then(res => {
                expect(res.status).toBe(201)
            });
        });

        it('should return data', () => {
            return supertest(server).post('/api/auth/register')
            .send(user2)
            .then(res => {
                expect(res.body.data).not.toBeNull()
            });
        });

        it('should not return non hashed password', () => {
            return supertest(server).post('/api/auth/register')
            .send(user3)
            .then(res => {
                expect(res.body.data.password).not.toBe('password')
            });
        });
    });

    describe('POST /auth/login', () => {
        it('should return 400 if sent no data', () => {
            return supertest(server).post('/api/auth/login')
            .send({})
            .then(res => {
                expect(res.status).toBe(400);
            });
        });

        it('should return 401 if user is not registered', () => {
            return supertest(server).post('/api/auth/login')
            .send(nonUser)
            .then(res => {
                expect(res.status).toBe(401);
            });
        })

        it('should return 200 if user is registered with right credentials', () => {
            return supertest(server).post('/api/auth/login')
            .send(user)
            .then(res => {
                token = res.body.token;
                expect(res.status).toBe(200);
            });
        });

        it('should return message: Welcome to our API', () => {
            return supertest(server).post('/api/auth/login')
            .send(user2)
            .then(res => {
                expect(res.body.message).toBe("Welcome to our API");
            });
        });
    });

    describe('GET /api/jokes', () => {
        it('should return 401 if no auth header', () => {
            return supertest(server).get('/api/jokes')
            .then(res => {
                expect(res.status).toBe(401)
            });
        });

        it('should return 401 if auth header is wrong', () => {
            return supertest(server).get('/api/jokes')
            .set('Authorization', 'igsakfghsdflgkhsd')
            .then(res => {
                expect(res.status).toBe(401)
            });
        });

        it('should return 200 if auth header is set', () => {
            return supertest(server).get('/api/jokes')
            .set('Authorization', token)
            .then(res => {
                expect(res.status).toBe(200)
            });
        });

        it('return an array of jokes', () => {
            return supertest(server).get('/api/jokes')
            .set('Authorization', token)
            .then(res => {
                expect(res.body).toBeTruthy();
            });
        });
    })
});