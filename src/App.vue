<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header>
      <nav>
        <h1>Kodero</h1>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  padding: 2rem;
}
</style>
