module.exports = {
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  preset: "ts-jest",
  globals: {
    "ts-jest": {},
  },
};
