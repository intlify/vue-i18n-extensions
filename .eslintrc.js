module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2015,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  extends: [
    // 'eslint:recommended',
    'plugin:vue/essential'
  ],
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 1 }]
  }
}
