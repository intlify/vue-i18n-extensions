<template>
  <p v-t="'hello'"></p>
</template>

<script>
import { useI18n } from 'vue-i18n'

export default {
  name: 'App',
  setup() {
    return useI18n()
  }
}
</script>
