<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from '../components/GameBoard.vue'

// Game state
const currentLevel = ref(1)

// Sample levels data (would come from a level system later)
const levels = ref([
  {
    level: 1,
    goalGrid: [
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red']
    ],
    title: "All Red",
    description: "Make the entire grid red using: p = red"
  },
  {
    level: 2,
    goalGrid: [
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'red', 'blue', 'red', 'blue']
    ],
    title: "Checkerboard",
    description: "Create a checkerboard pattern using x and y coordinates"
  },
  {
    level: 3,
    goalGrid: [
      ['blue', 'blue', 'red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'blue', 'blue'],
      ['blue', 'blue', 'red', 'blue', 'blue']
    ],
    title: "Red Stripe",
    description: "Create a red vertical stripe in the middle using if statements"
  }
])

// Get current level data
const currentLevelData = ref(levels.value[currentLevel.value - 1])

// Event handlers
function handleLevelComplete(level: number) {
  console.log(`Level ${level} completed! (showing win modal)`)
  // Level is complete, win modal is shown, but don't advance yet
}

function handleLevelContinue(level: number) {
  console.log(`Level ${level} continue clicked, advancing to next level`)
  
  if (level < levels.value.length) {
    // Advance to next level
    currentLevel.value = level + 1
    currentLevelData.value = levels.value[currentLevel.value - 1]
    console.log(`Advanced to level ${currentLevel.value}`)
  } else {
    // All levels completed!
    console.log('All levels completed! 🎉')
  }
}

function handleLevelRestart(level: number) {
  console.log(`Level ${level} restarted`)
  // Level restart is handled by GameBoard component
}
</script>

<template>
  <div class="kodero-game">
    <GameBoard
      :level="currentLevel"
      :goal-grid="currentLevelData.goalGrid"
      :grid-size="{ width: 5, height: 5 }"
      @level-complete="handleLevelComplete"
      @level-continue="handleLevelContinue"
      @level-restart="handleLevelRestart"
    />
  </div>
</template>

<style scoped>
.kodero-game {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
