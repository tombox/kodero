<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Import Google Font - Capriola */
@import url('https://fonts.googleapis.com/css2?family=Capriola&display=swap');

/* Global font styles */
* {
  font-family: 'Capriola', sans-serif;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Capriola', sans-serif;
}
</style>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Capriola', sans-serif;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

nav h1 {
  margin: 0;
  font-size: 1.5rem;
}

main {
  flex: 1;
}
</style>
