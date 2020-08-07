<template>
  <p v-t="'hello'"></p>
  <p v-t="{ path: hello, locale: 'en' }"></p>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'App',
  setup() {
    const hello = ref('hello')
    return { hello, ...useI18n() }
  }
}
</script>
