<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from '../components/GameBoard.vue'
import { CODE_PATTERNS } from '../utils/codeStructureBuilder'
import { loadLevelFromSnapshot, EXAMPLE_IF_ELSE_SNAPSHOT, LEVEL_2_SNAPSHOT } from '../utils/codeSnapshotLoader'
import { AVAILABLE_BLOCKS } from '../types/codeBlocks'

// Game state
const currentLevel = ref(0) // Start at 0 to show main menu
const isInSandboxMode = ref(false)

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
    availableBlocks: ['var-p', 'op-assign', 'color-red', 'color-blue'],
    initialCode: CODE_PATTERNS.simpleAssignment()
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
    availableBlocks: ['ctrl-if', 'var-x', 'op-less', 'num-2','num-4', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue'],
    initialCode: loadLevelFromSnapshot(LEVEL_2_SNAPSHOT)
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
    availableBlocks: ['ctrl-if', 'var-x', 'op-equals', 'num-2', 'num-3', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue'],
    initialCode: loadLevelFromSnapshot(EXAMPLE_IF_ELSE_SNAPSHOT)
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
    availableBlocks: ['ctrl-if', 'var-x', 'op-plus', 'var-y', 'op-modulo', 'num-2', 'op-equals', 'num-0', 'var-p', 'op-assign', 'color-red', 'ctrl-else', 'color-blue'],
    initialCode: CODE_PATTERNS.checkerboardTemplate()
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
const currentLevelData = ref(levels.value[0]) // Default to first level

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
    currentLevel.value = 0 // Return to main menu
  }
}

function startLevel() {
  currentLevel.value = 1
  currentLevelData.value = levels.value[0]
}

function handleLevelRestart(level: number) {
  console.log(`Level ${level} restarted`)
  // Level restart is handled by GameBoard component
}

// Sandbox mode handlers
function startSandboxMode() {
  console.log('Starting sandbox mode')
  isInSandboxMode.value = true
}

function exitSandboxMode() {
  console.log('Exiting sandbox mode')
  isInSandboxMode.value = false
}

// Sandbox configuration
const sandboxConfig = {
  title: "Sandbox Mode",
  description: "Experiment freely with all available blocks",
  hint: "Build any pattern you like! Use exportCodeStructure() in console to save your work.",
  goalGrid: [
    ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
    ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
    ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
    ['transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
    ['transparent', 'transparent', 'transparent', 'transparent', 'transparent']
  ],
  availableBlocks: AVAILABLE_BLOCKS.map(block => block.id),
  initialCode: {
    id: 'sandbox-structure',
    type: 'linear' as const,
    lines: [
      {
        id: 'line-1',
        type: 'assignment' as const,
        indentLevel: 0,
        parentLineId: undefined,
        slots: [
          { id: 'slot-0', placeholder: 'drop here' },
          { id: 'slot-1', placeholder: 'drop here' },
          { id: 'slot-2', placeholder: 'drop here' }
        ],
        placedBlocks: [null, null, null],
        minSlots: 3,
        maxSlots: 10
      }
    ]
  }
}
</script>

<template>
  <div class="kodero-game">
    <!-- Level Selection Screen -->
    <div v-if="!isInSandboxMode && currentLevel === 0" class="main-menu">
      <h1 class="game-title">⚄ Kodero</h1>
      <p class="game-subtitle">Visual Programming Adventure</p>
      
      <div class="menu-buttons">
        <button 
          class="menu-btn start-btn"
          @click="startLevel"
        >
          🚀 Start Level 1
        </button>
        
        <button 
          class="menu-btn sandbox-btn"
          @click="startSandboxMode"
        >
          🔬 Sandbox Mode
        </button>
      </div>
      
      <p class="menu-description">
        Start with guided levels or explore freely in sandbox mode!
      </p>
    </div>

    <!-- Sandbox Mode -->
    <div v-else-if="isInSandboxMode" class="sandbox-container">
      <div class="sandbox-header">
        <button 
          class="exit-sandbox-btn"
          @click="exitSandboxMode"
        >
          ← Exit Sandbox
        </button>
        <h2>🔬 Sandbox Mode</h2>
        <div class="sandbox-info">
          Use <code>exportCodeStructure()</code> in console to save your work!
        </div>
      </div>
      
      <GameBoard
        :level="0"
        :goal-grid="sandboxConfig.goalGrid"
        :level-title="sandboxConfig.title"
        :level-description="sandboxConfig.description"
        :level-hint="sandboxConfig.hint"
        :level-available-blocks="sandboxConfig.availableBlocks"
        :level-initial-code="sandboxConfig.initialCode"
        :grid-size="{ width: 5, height: 5 }"
        @level-restart="() => {}"
      />
    </div>

    <!-- Regular Level Mode -->
    <GameBoard
      v-else
      :level="currentLevel"
      :goal-grid="currentLevelData.goalGrid"
      :level-title="currentLevelData.title"
      :level-description="currentLevelData.description"
      :level-hint="currentLevelData.hint"
      :level-available-blocks="currentLevelData.availableBlocks"
      :level-initial-code="currentLevelData.initialCode"
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

/* Main Menu Styles */
.main-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
}

.game-title {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.game-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.menu-buttons {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.menu-btn {
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 200px;
}

.start-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 36, 0.4);
}

.sandbox-btn {
  background: linear-gradient(135deg, #4ecdc4, #26d0ce);
  color: white;
}

.sandbox-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(78, 205, 196, 0.4);
}

.menu-description {
  font-size: 1.1rem;
  opacity: 0.8;
  max-width: 600px;
  line-height: 1.6;
}

/* Sandbox Mode Styles */
.sandbox-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sandbox-header {
  background: linear-gradient(135deg, #4ecdc4, #26d0ce);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sandbox-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.sandbox-info {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}

.sandbox-info code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
}

.exit-sandbox-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.exit-sandbox-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

/* Responsive design */
@media (max-width: 768px) {
  .game-title {
    font-size: 3rem;
  }
  
  .game-subtitle {
    font-size: 1.2rem;
  }
  
  .menu-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .menu-btn {
    min-width: 250px;
  }
}
</style>
