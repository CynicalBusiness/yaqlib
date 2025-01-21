const nx = require("@nx/eslint-plugin");
const eslintImport = require("eslint-plugin-import");
const { fixupPluginRules } = require("@eslint/compat");

module.exports = [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],

    eslintImport.flatConfigs.typescript,
    {
        plugins: {
            import: fixupPluginRules(eslintImport),
        },
    },

    {
        ignores: ["**/dist"],
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]? js$"],
                    depConstraints: [
                        {
                            sourceTag: "*",
                            onlyDependOnLibsWithTags: ["*"],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs",
        ],
        // Override or add rules here
        rules: {
            quotes: ["warn", "double", { allowTemplateLiterals: true }],
            "import/extensions": ["warn", "ignorePackages"],
        },
    },
];
