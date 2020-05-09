import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import en from './locales/en.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  locale: 'ja',
  messages: {
    en,
    ja
  }
})

const app = createApp(App)

app.use(i18n)
app.mount('#app')
