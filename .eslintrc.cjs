module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb', 'plugin:prettier/recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'security/detect-non-literal-regexp': 'off',
    'no-underscore-dangle': 'off',
    'no-useless-escape': 'off',
    'no-console': 'off',
  },
};
