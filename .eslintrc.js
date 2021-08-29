/* eslint quote-props: [error, consistent-as-needed] */

module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "plugin:react/recommended",
        "airbnb-base",
        "airbnb/rules/react",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
    },
    plugins: [
        "react",
        "@typescript-eslint",
    ],
    rules: {
        "arrow-parens": ["error", "as-needed"],
        "arrow-spacing": "error",
        "brace-style": "off",
        "@typescript-eslint/brace-style": ["error", "stroustrup"],
        "@typescript-eslint/camelcase": "off",
        "comma-dangle": "off",
        "@typescript-eslint/comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],
        "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
        "react/jsx-props-no-spreading": "off",
        "import/extensions": ["error", "ignorePackages", {
            ts: "never",
            tsx: "never",
        }],
        "indent": "off",
        "@typescript-eslint/indent": ["error", 4, {
            SwitchCase: 1,
            ignoredNodes: ["JSXElement", "JSXElement *", "JSXFragment", "JSXFragment *"],
        }],
        "key-spacing": "error",
        "max-len": ["warn", {
            code: 120,
        }],
        "no-bitwise": "off",
        "no-console": "off",
        "no-continue": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-param-reassign": "off",
        "no-plusplus": ["error", {
            allowForLoopAfterthoughts: true,
        }],
        "no-undef": "off",
        "no-underscore-dangle": "off",
        "no-unresolved": "off",
        "import/no-unresolved": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_+$",
        }],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "object-curly-newline": ["error", {
            consistent: true,
        }],
        "import/prefer-default-export": "off",
        "quotes": "off",
        "@typescript-eslint/quotes": ["error", "double"],
        "semi": ["error", "always"],
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [".ts", ".tsx", ".js", ".jsx"],
            },
        },
    },
};
