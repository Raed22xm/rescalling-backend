const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const userModel = require('../src/models/user.model');
const resizeModel = require('../src/models/resize.model');

let mongoServer;
let testUser;
let accessToken;

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
    await resizeModel.deleteMany({});

    // Create a test user and get tokens
    await request(app)
        .post('/api/v1/users/signup')
        .send({
            name: 'Resize Test User',
            email: 'resize@example.com',
            password: 'password123'
        });

    const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
            email: 'resize@example.com',
            password: 'password123'
        });

    testUser = loginResponse.body.user;
    accessToken = loginResponse.body.accessToken;
});

describe('Resize Controller - Input Validation', () => {

    describe('POST /api/v1/resize/resizeImg', () => {

        it('should return 400 if imageLink is missing', async () => {
            const response = await request(app)
                .post('/api/v1/resize/resizeImg')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    userId: testUser._id
                })
                .expect(400);

            expect(response.body.message).toContain('Invalid Link');
        });

        it('should return 400 if userId is missing', async () => {
            const response = await request(app)
                .post('/api/v1/resize/resizeImg')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    imageLink: 'https://example.com/image.jpg'
                })
                .expect(400);

            expect(response.body.message).toContain('user id not available');
        });

        it('should return 400 for invalid user id', async () => {
            const response = await request(app)
                .post('/api/v1/resize/resizeImg')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    imageLink: 'https://example.com/image.jpg',
                    userId: new mongoose.Types.ObjectId().toString()
                })
                .expect(400);

            expect(response.body.message).toContain('Invalid user');
        });
    });

    describe('DELETE /api/v1/resize/:resizeId', () => {

        it('should delete a resize record successfully', async () => {
            // Create a test resize record directly in DB
            const resize = await resizeModel.create({
                imageLink: 'https://cloudinary.com/delete-test.jpg',
                imageFormat: 'jpg',
                date: new Date(),
                options: {},
                userId: testUser._id
            });

            const response = await request(app)
                .delete(`/api/v1/resize/${resize._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.message).toContain('Deleted resize');

            // Verify it's deleted from database
            const deleted = await resizeModel.findById(resize._id);
            expect(deleted).toBeNull();
        });
    });
});

