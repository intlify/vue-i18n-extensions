<template>
  <div>
    <p id="directive-string" v-t="'hello'"></p>
    <p id="directive-object" v-t="{ path: hello, locale: 'en' }"></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hello = ref('hello')
</script>
