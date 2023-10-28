module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb", // 맨 처음
    "airbnb/hooks",
    "plugin:prettier/recommended", // 맨 마지막
  ],
  // 원하는 규칙 추가하기
  rules: {
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx"],
      },
    ],
  },
};
