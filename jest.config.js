'use strict';
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  coverageProvider: "v8",
  preset: 'ts-jest',
  coveragePathIgnorePatterns: ['node_modules'],
  testEnvironment: 'node',
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["js", "ts", "json", "node"],
  maxConcurrency: 5,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    ".git/.*",
    "node_modules/.*"
  ],
  transformIgnorePatterns: [
    "node_modules/.*",
    ".*\\.js"
  ],
  verbose: true,
  cacheDirectory: ".jest-cache",
};
