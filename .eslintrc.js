const path = require("path");

module.exports = {
    extends: [require.resolve("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json")],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: path.resolve(__dirname, "tsconfig.json")
    },
    rules: {
        curly: "off",
        "arrow-parens": "off",
        "object-shorthand": "off",
        "react/no-access-state-in-setstate": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-boolean-value": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }
        ],
        "no-unused-vars": "off",
        "no-undef": "off",
        "no-empty-source": "off"
    }
};
