module.exports = {
  // parser: '@typescript-eslint/parser',
  // parserOptions: {
  //   ecmaVersion: 2020,
  //   sourceType: 'module',
  // },
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  plugins: ['@typescript-eslint'],
}
