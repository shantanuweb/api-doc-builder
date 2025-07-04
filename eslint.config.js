module.exports = [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: require('@babel/eslint-parser'),
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: ['@babel/preset-react'] },
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
];
