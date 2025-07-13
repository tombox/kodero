<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CanvasGrid from './CanvasGrid.vue'
import GoalGrid from './GoalGrid.vue'
import CodeEditor from './CodeEditor.vue'
import Toolbox from './Toolbox.vue'
import { AVAILABLE_BLOCKS } from '../types/codeBlocks'
import { getGridComparisonResult } from '../utils/gridComparison'

// Props for level configuration
interface Props {
  level?: number
  goalGrid?: string[][]
  availableBlocks?: typeof AVAILABLE_BLOCKS
  gridSize?: { width: number; height: number }
  levelTitle?: string
  levelDescription?: string
  levelHint?: string
  levelAvailableBlocks?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  goalGrid: () => [
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red']
  ],
  availableBlocks: () => AVAILABLE_BLOCKS,
  gridSize: () => ({ width: 5, height: 5 }),
  levelTitle: 'Level',
  levelDescription: 'Complete the pattern',
  levelHint: 'Use code blocks to match the goal',
  levelAvailableBlocks: () => []
})

// Events
const emit = defineEmits<{
  'level-complete': [level: number]
  'level-continue': [level: number]
  'level-restart': [level: number]
}>()

// Game state
const canvasGrid = ref<string[][]>([
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
])

const isComplete = ref(false)
const showWinAnimation = ref(false)
const comparisonResult = ref(getGridComparisonResult(canvasGrid.value, props.goalGrid))

// Watch for grid changes and check win condition
watch(() => canvasGrid.value, (newGrid) => {
  comparisonResult.value = getGridComparisonResult(newGrid, props.goalGrid)
  
  if (comparisonResult.value.isComplete && !isComplete.value) {
    // Level completed!
    isComplete.value = true
    showWinAnimation.value = true
    
    // Emit level complete event (but keep modal open until user clicks Continue)
    emit('level-complete', props.level)
  } else if (!comparisonResult.value.isComplete && isComplete.value) {
    // Level no longer complete (user changed code)
    isComplete.value = false
    showWinAnimation.value = false
  }
}, { deep: true })

// Watch for level/goal changes and reset the game state
watch(() => [props.level, props.goalGrid], ([newLevel, newGoalGrid], [oldLevel]) => {
  console.log(`GameBoard: Level changed from ${oldLevel} to ${newLevel}`)
  
  // Reset game state for new level
  canvasGrid.value = Array(props.gridSize.height).fill(null).map(() => 
    Array(props.gridSize.width).fill('')
  )
  isComplete.value = false
  showWinAnimation.value = false
  
  // Update comparison result with new goal
  comparisonResult.value = getGridComparisonResult(canvasGrid.value, newGoalGrid as string[][])
}, { deep: true })

// Event handlers
function handleGridUpdated(grid: string[][]) {
  console.log('Grid updated in GameBoard:', grid)
  canvasGrid.value = grid
}

function handleEvaluationError(errors: any[]) {
  console.warn('Code evaluation errors:', errors)
  // TODO: Show error indicators in the UI
}

function handleCodeExecuted(result: any) {
  console.log('Code executed:', result)
}

function handleCodeEditorStructureChanged(structure: any) {
  console.log('CodeEditor structure changed:', structure)
}

function restartLevel() {
  // Reset canvas grid to default state
  canvasGrid.value = Array(props.gridSize.height).fill(null).map(() => 
    Array(props.gridSize.width).fill('')
  )
  isComplete.value = false
  showWinAnimation.value = false
  emit('level-restart', props.level)
}

function nextLevel() {
  console.log('GameBoard: Continue button clicked, advancing to next level')
  // Hide animation and emit level continue event to advance to next level
  showWinAnimation.value = false
  emit('level-continue', props.level)
}

// Available blocks for the toolbox (filtered for this level)
const levelBlocks = computed(() => {
  // If level has custom available blocks, use those; otherwise use all blocks
  if (props.levelAvailableBlocks && props.levelAvailableBlocks.length > 0) {
    // Filter the available blocks to only include the ones specified for this level
    return props.availableBlocks.filter(block => 
      props.levelAvailableBlocks!.includes(block.id)
    )
  }
  return [...props.availableBlocks] // Create a mutable copy of all blocks
})

// Debug: Log current grid state
console.log('GameBoard mounted with canvasGrid:', canvasGrid.value)
console.log('GameBoard goalGrid:', props.goalGrid)
</script>

<template>
  <div class="game-board">
    <!-- Game Header -->
    <header class="game-header">
      <div class="level-info">
        <h1>Level {{ level }}: {{ levelTitle }}</h1>
        <p class="level-description">{{ levelDescription }}</p>
        <div class="progress-info">
          <span class="match-percentage">{{ comparisonResult.matchPercentage }}%</span>
          <span class="cells-matched">{{ comparisonResult.matchingCells }}/{{ comparisonResult.totalCells }}</span>
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          class="action-btn restart-btn"
          @click="restartLevel"
          title="Restart Level"
        >
          🔄 Restart
        </button>
      </div>
    </header>

    <!-- Main Game Area -->
    <main class="game-main">
      <!-- Left Panel: Toolbox -->
      <aside class="toolbox-panel">
        <Toolbox
          :available-blocks="levelBlocks"
          :group-by-category="true"
          :searchable="false"
          class="game-toolbox"
        />
      </aside>

      <!-- Center Panel: Code Editor -->
      <section class="editor-panel">
        <div class="panel-header">
          <h2>Code Editor</h2>
          <p>Build your pattern here</p>
        </div>
        <CodeEditor
          :key="`level-${level}`"
          template="UNIFIED"
          :enable-evaluation="true"
          @structure-changed="handleCodeEditorStructureChanged"
          @code-executed="handleCodeExecuted"
          @grid-updated="handleGridUpdated"
          @evaluation-error="handleEvaluationError"
          class="game-editor"
        />
      </section>

      <!-- Right Panel: Grids -->
      <aside class="grids-panel">
        <div class="grid-section">
          <div class="grid-header">
            <span class="grid-title">GENERATED PATTERN</span>
          </div>
          <CanvasGrid 
            :grid="canvasGrid"
            class="canvas-grid"
          />
        </div>
        
        <div class="grid-section">
          <div class="grid-header">
            <span class="grid-title">GOAL</span>
          </div>
          <GoalGrid 
            :key="`goal-${level}`"
            :goal-grid="props.goalGrid"
            class="goal-grid"
          />
        </div>

        
      </aside>
    </main>

    <!-- Win Animation Modal -->
    <Transition name="win-modal">
      <div 
        v-if="showWinAnimation"
        class="win-modal-overlay"
        @click="nextLevel"
      >
        <div class="win-modal">
          <div class="win-content">
            <div class="win-emoji">🎉</div>
            <h2>Level {{ level }} Complete!</h2>
            <p>Perfect match! You've mastered this pattern.</p>
            <div class="win-stats">
              <div class="stat">
                <span class="stat-label">Accuracy</span>
                <span class="stat-value">{{ comparisonResult.matchPercentage }}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Cells</span>
                <span class="stat-value">{{ comparisonResult.matchingCells }}/{{ comparisonResult.totalCells }}</span>
              </div>
            </div>
            <button 
              class="next-btn"
              @click.stop="nextLevel"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-board {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Game Header */
.game-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.level-info h1 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.level-description {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
  font-style: italic;
}

.progress-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.match-percentage {
  font-weight: 600;
  color: #28a745;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn {
  background-color: #6c757d;
  color: white;
}

.restart-btn:hover {
  background-color: #5a6268;
}

/* Main Game Area */
.game-main {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1rem;
  padding: 1rem;
  min-height: 500px; /* Ensure minimum height for content */
  /* Remove fixed height to allow natural content flow */
}

/* Panel Styles */
.toolbox-panel,
.editor-panel,
.grids-panel {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;

}

.panel-header {
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.panel-header h2,
.panel-header h3 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
}

.panel-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.level-hint {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #0056b3;
}

/* Toolbox Panel */
.toolbox-panel {
  overflow: hidden;
}

.game-toolbox {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Editor Panel */
.editor-panel {
  overflow: visible; /* Allow content to determine height */
}

.game-editor {
  margin: 1rem;
  border: none;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  /* Remove flex: 1 and min-height to allow natural sizing */
}

.game-editor :deep(.code-editor) {
  border: none;
  background-color: transparent;
  /* Remove height and flex properties to allow natural sizing */
}

.game-editor :deep(.code-editor__body) {
  /* Remove height restrictions - let content determine size */
  overflow: visible;
}

.game-editor :deep(.code-lines) {
  /* Ensure lines container only takes space it needs */
  display: flex;
  flex-direction: column;
  gap: 12px; /* Match the gap from CodeEditor component */
}

/* Grids Panel */
.grids-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* Remove overflow: hidden to allow content to be visible */
}

.grid-section {
  display: flex;
  flex-direction: column;
  /* Remove flex: 1 to allow natural sizing */
}

.grid-section .panel-header,
.grid-section .grid-header {
  padding: 1rem 1.5rem 0.5rem;
  border-bottom: 1px solid #f1f3f4;
  flex-shrink: 0;
}

.grid-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #007aff;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.5rem;
}

.grid-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.result-status {
  font-weight: 500;
  color: #6c757d;
  transition: color 0.2s ease;
}

.result-status.complete {
  color: #28a745;
}

.goal-grid,
.canvas-grid {
  padding: 0rem;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Remove flex: 1 and min-height to allow natural sizing */
}

/* Win Modal */
.win-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.win-modal {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.win-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.win-emoji {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.win-modal h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.win-modal p {
  margin: 0;
  color: #6c757d;
}

.win-stats {
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #28a745;
}

.next-btn {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.next-btn:hover {
  background-color: #0056b3;
}

/* Win Modal Animation */
.win-modal-enter-active {
  transition: all 0.3s ease;
}

.win-modal-leave-active {
  transition: all 0.2s ease;
}

.win-modal-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.win-modal-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .game-main {
    grid-template-columns: 260px 1fr 280px;
  }
}

@media (max-width: 1024px) {
  .game-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    gap: 1rem;
  }
  
  .toolbox-panel,
  .grids-panel {
    order: 1;
  }
  
  .editor-panel {
    order: 2;
  }
  
  .grids-panel {
    order: 3;
    flex-direction: row;
    height: auto;
  }
  
  .grid-section {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .game-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .progress-info {
    justify-content: center;
  }
  
  .game-main {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .grids-panel {
    flex-direction: column;
  }
  
  .win-modal {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .win-stats {
    gap: 1rem;
  }
}
</style>