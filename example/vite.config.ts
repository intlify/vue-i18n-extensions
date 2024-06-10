import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueI18n from '@intlify/unplugin-vue-i18n/vite'
// import bodyParser from 'body-parser'
import { transformVTDirective } from '../dist/esm/index'
// import { transformVTDirective } from '@intlify/vue-i18n-extensions'

/**
 * These imports simulate the loading of resources from the database
 */
import en from './src/locales/en.json' // english resources
import ja from './src/locales/ja.json' // japanese resources

// import type { Plugin } from 'vite'
// import type { ServerResponse } from 'http'
import { createI18n } from 'vue-i18n'
// import type { ResourceSchema } from './locales/message'

// function serialize(res: ServerResponse, locales: any): void {
//   res.setHeader('Content-Type', 'application/json')
//   res.write(JSON.stringify(locales))
// }

/**
 * This plugin is simulated back-end server
 */
// const backend = (): Plugin => ({
//   name: 'backend',
//   configureServer(server) {
//     server.middlewares.use(bodyParser.json())
//     // `/api/resources/en` endpoint returns the response as `en` resources
//     server.middlewares.use('/api/resources/en', (req, res) => {
//       serialize(res, en)
//       res.end()
//     })
//     // `/api/resources/ja` endpoint returns the response as `ja` resources
//     server.middlewares.use('/api/resources/ja', (req, res) => {
//       serialize(res, ja)
//       res.end()
//     })
//   }
// })

// const i18n = vueI18n({
//   jitCompilation: true
// })
const i18n = createI18n({
  locale: 'ja',
  messages: {
    en,
    ja
  }
})

const transformVT = transformVTDirective(i18n)
// console.log(transformVT.toString())
// https://vitejs.dev/config/
export default defineConfig({
  // build: {
  //   target: 'esnext'
  // },

  plugins: [
    vue({
      template: {
        compilerOptions: {
          directiveTransforms: { t: transformVT }
        }
      }
    })
  ]
})
