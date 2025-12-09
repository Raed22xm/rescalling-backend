// Jest setup file for test environment
process.env.ACCESS_TOKEN_SECRET_KEY = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET_KEY = 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXPIRE = '10d';
process.env.REFRESH_TOKEN_EXPIRE = '7d';
process.env.NODE_ENV = 'test';
