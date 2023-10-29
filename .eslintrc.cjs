module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["airbnb", "plugin:prettier/recommended", "prettier"],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
};
