<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from '../components/GameBoard.vue'

// Game state
const currentLevel = ref(1)

// 10 Progressive levels - from basic to advanced
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
    description: "Fill the entire grid with red color",
    hint: "Use: p = red",
    availableBlocks: ['var-p', 'op-assign', 'color-red']
  },
  {
    level: 2,
    goalGrid: [
      ['red', 'red', 'blue', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue']
    ],
    title: "Half and Half",
    description: "Split the grid: red on left, blue on right",
    hint: "Use: if x < 2 then p = red else p = blue",
    availableBlocks: ['ctrl-if', 'var-x', 'op-less', 'num-2', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
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
    title: "Center Stripe",
    description: "Create a red vertical stripe in the center",
    hint: "Use: if x == 2 then p = red else p = blue",
    availableBlocks: ['ctrl-if', 'var-x', 'op-equals', 'num-2', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
  },
  {
    level: 4,
    goalGrid: [
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'red', 'red', 'red', 'red'],
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['blue', 'blue', 'blue', 'blue', 'blue']
    ],
    title: "Center Row",
    description: "Create a red horizontal stripe in the center",
    hint: "Use: if y == 2 then p = red else p = blue",
    availableBlocks: ['ctrl-if', 'var-y', 'op-equals', 'num-2', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
  },
  {
    level: 5,
    goalGrid: [
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red']
    ],
    title: "Checkerboard",
    description: "Create an alternating checkerboard pattern",
    hint: "Use: if (x + y) % 2 == 0 then p = red else p = blue",
    availableBlocks: ['ctrl-if', 'var-x', 'op-plus', 'var-y', 'op-modulo', 'num-2', 'op-equals', 'num-0', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
  },
  {
    level: 6,
    goalGrid: [
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'blue', 'blue', 'blue', 'red'],
      ['red', 'blue', 'green', 'blue', 'red'],
      ['red', 'blue', 'blue', 'blue', 'red'],
      ['red', 'red', 'red', 'red', 'red']
    ],
    title: "Bullseye",
    description: "Create concentric squares with different colors",
    hint: "Use nested conditions based on distance from edges",
    availableBlocks: ['ctrl-if', 'var-x', 'var-y', 'op-equals', 'op-less-equal', 'num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'var-p', 'op-assign', 'color-red', 'color-blue', 'color-green', 'ctrl-else']
  },
  {
    level: 7,
    goalGrid: [
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue'],
      ['red', 'red', 'red', 'blue', 'blue'],
      ['red', 'red', 'red', 'red', 'blue']
    ],
    title: "Triangle",
    description: "Create a red triangle in the bottom-left",
    hint: "Use: if x <= y then p = red else p = blue",
    availableBlocks: ['ctrl-if', 'var-x', 'op-less-equal', 'var-y', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
  },
  {
    level: 8,
    goalGrid: [
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red'],
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'blue', 'red', 'blue', 'red']
    ],
    title: "Dotted Lines",
    description: "Create red dots on even rows, blue elsewhere",
    hint: "Use multiple conditions with && operator",
    availableBlocks: ['ctrl-if', 'var-x', 'var-y', 'op-modulo', 'num-2', 'op-equals', 'num-0', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue']
  },
  {
    level: 9,
    goalGrid: [
      ['green', 'blue', 'blue', 'blue', 'green'],
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['blue', 'blue', 'red', 'blue', 'blue'],
      ['blue', 'red', 'blue', 'red', 'blue'],
      ['green', 'blue', 'blue', 'blue', 'green']
    ],
    title: "Complex Pattern",
    description: "Mix of diagonal and corner patterns",
    hint: "Combine multiple if-else conditions",
    availableBlocks: ['ctrl-if', 'var-x', 'var-y', 'op-equals', 'op-plus', 'op-modulo', 'num-0', 'num-1', 'num-2', 'num-3', 'num-4', 'var-p', 'op-assign', 'color-red', 'color-blue', 'color-green', 'ctrl-else']
  },
  {
    level: 10,
    goalGrid: [
      ['red', 'blue', 'green', 'blue', 'red'],
      ['blue', 'green', 'red', 'green', 'blue'],
      ['green', 'red', 'blue', 'red', 'green'],
      ['blue', 'green', 'red', 'green', 'blue'],
      ['red', 'blue', 'green', 'blue', 'red']
    ],
    title: "Master Challenge",
    description: "Complex three-color rotating pattern",
    hint: "Use modulo arithmetic with multiple colors",
    availableBlocks: ['ctrl-if', 'var-x', 'var-y', 'op-plus', 'op-minus', 'op-modulo', 'num-0', 'num-1', 'num-2', 'num-3', 'var-p', 'op-assign', 'color-red', 'color-blue', 'color-green', 'ctrl-else']
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
      :level-title="currentLevelData.title"
      :level-description="currentLevelData.description"
      :level-hint="currentLevelData.hint"
      :level-available-blocks="currentLevelData.availableBlocks"
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
