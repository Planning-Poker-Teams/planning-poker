module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  "testPathIgnorePatterns": [
    "/node_modules/",
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {
    "ts-jest": {},
  },
  globalSetup: "./src/setup.ts",
  globalTeardown: "./src/teardown.ts",
};
