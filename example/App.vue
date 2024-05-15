<template>
  <p v-t="'hello'"></p>
  <p v-t="{ path: hello, locale: 'en' }"></p>
</template>

<script setup>
import { ref } from 'vue'

const hello = ref('hello')
</script>
