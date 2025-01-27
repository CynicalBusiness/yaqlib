export default {
    displayName: "@yaqlib/core",
    preset: "../../jest.preset.js",
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]s$": [
            "ts-jest",
            { tsconfig: "<rootDir>/tsconfig.spec.json" },
        ],
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/packages/core",
};
