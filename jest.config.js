module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests", "<rootDir>/__tests__"],
  verbose: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ["./jest.setup.js"]
};
