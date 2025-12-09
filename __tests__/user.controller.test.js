const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const userModel = require('../src/models/user.model');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await userModel.deleteMany({});
});

describe('User Controller', () => {

    describe('POST /api/v1/users/signup', () => {

        it('should create a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/v1/users/signup')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('User created successfully');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.name).toBe(userData.name);
            expect(response.body.user.password).toBeUndefined();
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/v1/users/signup')
                .send({ email: 'test@example.com' })
                .expect(400);

            expect(response.body.message).toContain('Missing required fields');
        });

        it('should return 409 if user already exists', async () => {
            const userData = {
                name: 'Test User',
                email: 'duplicate@example.com',
                password: 'password123'
            };

            // Create first user
            await request(app)
                .post('/api/v1/users/signup')
                .send(userData)
                .expect(201);

            // Try to create duplicate
            const response = await request(app)
                .post('/api/v1/users/signup')
                .send(userData)
                .expect(409);

            expect(response.body.message).toContain('already exists');
        });
    });

    describe('POST /api/v1/users/login', () => {

        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/v1/users/signup')
                .send({
                    name: 'Login Test User',
                    email: 'login@example.com',
                    password: 'password123'
                });
        });

        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body.message).toBe('login successfull');
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe('login@example.com');
        });

        it('should return 401 with incorrect password', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.message).toBe('Invalid Credentials');
        });

        it('should return 401 for non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(401);

            expect(response.body.message).toBe('Invalid Credentials');
        });
    });
});
