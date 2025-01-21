const nxPreset = require("@nx/jest/preset").default;

module.exports = {
    ...nxPreset,

    coverageProvider: "v8",
    collectCoverageFrom: ["<rootDir>/src/lib/**/*.{ts,tsx}"],
};
