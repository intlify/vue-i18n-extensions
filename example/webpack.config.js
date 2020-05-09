const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const { createI18n } = require('vue-i18n')
const en = require('./locales/en.json')
const ja = require('./locales/ja.json')
const { defineTransformVT } = require('../lib/index')

const i18n = createI18n({
  locale: 'ja',
  messages: {
    en,
    ja
  }
})
const transformVT = defineTransformVT(i18n)

module.exports = {
  mode: 'development',
  entry: {
    app: path.resolve(__dirname, './main.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/'
  },
  resolve: {
    alias: {
      // this isn't technically needed, since the default `vue` entry for bundlers
      // is a simple `export * from '@vue/runtime-dom`. However having this
      // extra re-export somehow causes webpack to always invalidate the module
      // on the first HMR update and causes the page to reload.
      vue: '@vue/runtime-dom'
    }
  },
  devServer: {
    stats: 'minimal',
    contentBase: __dirname
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                directiveTransforms: { t: transformVT }
              }
            }
          }
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
      /*,
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        use: [
          {
            loader: path.resolve(__dirname, '../lib/index.js'),
            options: {
              preCompile: true
            }
          }
        ]
      }
      */
    ]
  },
  plugins: [new VueLoaderPlugin()]
}
