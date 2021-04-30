/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
    return {
        // Indicates whether the coverage information should be collected while executing the test
        collectCoverage: true,

        // An array of glob patterns indicating a set of files for which coverage information should be collected
        collectCoverageFrom: [
            "src/*.ts",
            "!src/*.d.ts"
        ],

        // The directory where Jest should output its coverage files
        coverageDirectory: "coverage",

        // A list of reporter names that Jest uses when writing coverage reports
        coverageReporters: [
            "text"
        ],

        // A preset that is used as a base for Jest's configuration
        preset: "ts-jest",

        // The root directory that Jest should scan for tests and modules within
        rootDir: './',

        // The test environment that will be used for testing
        testEnvironment: "node",
    };
};
