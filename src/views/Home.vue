<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Welcome to Kodero!')
const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
  <div class="home">
    <h1>{{ message }}</h1>
    <p>This is your Vue 3 + TypeScript + Vite application.</p>

    <div class="counter">
      <button
        type="button"
        @click="increment"
      >
        Count is: {{ count }}
      </button>
    </div>

    <div class="info">
      <p>Edit <code>src/views/Home.vue</code> to test hot module replacement.</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.counter {
  margin: 2rem 0;
}

button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
}

code {
  background-color: #e8e8e8;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
