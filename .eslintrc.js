const path = require("path");

module.exports = {
    extends: [
        require.resolve("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json"),
        "plugin:react/jsx-runtime"
    ],
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
        "no-empty-source": "off",

        // React best-practice rules (beyond recommended)
        "react/jsx-no-target-blank": "error",           // require rel="noopener" with target="_blank"
        "react/jsx-no-useless-fragment": "warn",         // disallow unnecessary <> fragments
        "react/no-array-index-key": "warn",              // warn on using array index as key
        "react/no-unstable-nested-components": "warn",   // catch components defined inside render
        "react/jsx-no-constructed-context-values": "warn", // avoid re-creating context values
        "react/no-unused-state": "warn",                 // detect unused state fields
        "react/self-closing-comp": "warn",               // enforce <Component /> over <Component></Component>
        "react/void-dom-elements-no-children": "error",  // no children on <br>, <img>, etc.
        "react/jsx-key": ["error", { checkFragmentShorthand: true }], // require keys in iterators (upgrade from recommended)

        // React Hooks strictness (upgrade from base warn to error)
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn"
    }
};
