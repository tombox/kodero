<script setup lang="ts">
import { ref } from 'vue'
import CanvasGrid from '../components/CanvasGrid.vue'
import GoalGrid from '../components/GoalGrid.vue'
import CodeBlock from '../components/CodeBlock.vue'
import CodeSlot from '../components/CodeSlot.vue'
import CodeEditor from '../components/CodeEditor.vue'
import Toolbox from '../components/Toolbox.vue'
import { AVAILABLE_BLOCKS, type CodeBlock as CodeBlockType } from '../types/codeBlocks'
import { getGridComparisonResult } from '../utils/gridComparison'

// Sample data for demonstration
const sampleCanvasGrid = ref([
  ['red', 'red', 'red', 'red', 'red'],
  ['blue', 'blue', 'blue', 'blue', 'blue'],
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'red', 'red', 'red', 'red']
])

const sampleGoalGrid = ref([
  ['blue', 'blue', 'blue', 'blue', 'blue'],
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'red', 'red', 'red', 'red'],
  ['red', 'red', 'red', 'red', 'red']
])

// Demo code blocks
const demoBlocks = AVAILABLE_BLOCKS.slice(0, 12)

// Computed comparison result
const comparisonResult = ref(getGridComparisonResult(sampleCanvasGrid.value, sampleGoalGrid.value))

// Event handlers for demo
function handleBlockSelect(block: any) {
  console.log('Block selected:', block)
}

function handleBlockDragStart(block: any) {
  console.log('Block drag started:', block)
}

function toggleGridCompletion() {
  if (comparisonResult.value.isComplete) {
    // Make it incomplete
    sampleCanvasGrid.value[0][0] = 'red'
  } else {
    // Make it complete
    sampleCanvasGrid.value[0][0] = 'blue'
  }
  comparisonResult.value = getGridComparisonResult(sampleCanvasGrid.value, sampleGoalGrid.value)
}

// Phase 3 demo state
const slotBlocks = ref<(CodeBlockType | null)[]>([
  null, // Empty slot
  { id: 'demo-1', type: 'variable', value: 'x' }, // Filled slot
  null, // Empty slot with type restriction
])

function handleBlockDropped(targetSlotIndex: number, blockData: any) {
  console.log(`Block dropped: ${blockData.type}(${blockData.value}) -> slot ${targetSlotIndex}`)
  
  // Find if this block came from another slot and remove it from there
  const sourceSlotIndex = slotBlocks.value.findIndex(block => 
    block && block.id === blockData.id
  )
  
  if (sourceSlotIndex !== -1 && sourceSlotIndex !== targetSlotIndex) {
    console.log(`✅ Moved block from slot ${sourceSlotIndex} to slot ${targetSlotIndex}`)
    slotBlocks.value[sourceSlotIndex] = null
  }
  
  // Place the block in the new slot
  slotBlocks.value[targetSlotIndex] = blockData
}

function handleBlockRemoved(slotIndex: number, block: any) {
  console.log(`Block removed from slot ${slotIndex}:`, block)
  slotBlocks.value[slotIndex] = null
}

// Phase 4 demo state - CodeEditor (now unified)
const selectedTemplate = ref<'UNIFIED'>('UNIFIED')

function handleCodeEditorStructureChanged(structure: any) {
  console.log('CodeEditor structure changed:', structure)
}

function handleCodeExecuted(result: any) {
  console.log('Code executed:', result)
}

function handleGridUpdated(grid: string[][]) {
  console.log('Grid updated from code evaluation:', grid)
  // Update the canvas grid with the evaluated result
  sampleCanvasGrid.value = grid
  
  // Update comparison result in real-time
  comparisonResult.value = getGridComparisonResult(sampleCanvasGrid.value, sampleGoalGrid.value)
}

function handleEvaluationError(errors: any[]) {
  console.warn('Code evaluation errors:', errors)
  // Could show error indicators in the UI here
}

</script>

<template>
  <div class="kodero-playground">
    <header class="playground-header">
      <h1>🎮 Kodero Development Playground</h1>
      <p>Visual testing environment for completed components</p>
    </header>

    <!-- Phase 1: Grid System Demo -->
    <section class="demo-section">
      <h2>📊 Phase 1: Grid System (Completed)</h2>
      
      <div class="grid-demo">
        <div class="grid-container">
          <CanvasGrid :grid="sampleCanvasGrid" />
          <div class="vs">
            VS
          </div>
          <GoalGrid :goal-grid="sampleGoalGrid" />
        </div>
        
        <div class="grid-status">
          <div
            class="status-item"
            :class="{ complete: comparisonResult.isComplete }"
          >
            <strong>Status:</strong> {{ comparisonResult.isComplete ? 'Complete! 🎉' : 'Incomplete' }}
          </div>
          <div class="status-item">
            <strong>Match:</strong> {{ comparisonResult.matchPercentage }}%
          </div>
          <div class="status-item">
            <strong>Cells:</strong> {{ comparisonResult.matchingCells }}/{{ comparisonResult.totalCells }}
          </div>
          <button
            class="demo-button"
            @click="toggleGridCompletion"
          >
            {{ comparisonResult.isComplete ? 'Make Incomplete' : 'Make Complete' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Phase 2: Code Block System Demo -->
    <section class="demo-section">
      <h2>🧩 Phase 2: Code Block System (Completed)</h2>
      
      <div class="blocks-demo">
        <div class="toolbox-container">
          <h3>Toolbox (Grouped)</h3>
          <Toolbox
            :available-blocks="demoBlocks"
            :group-by-category="true"
            :searchable="true"
            @block-select="handleBlockSelect"
            @block-drag-start="handleBlockDragStart"
          />
        </div>

        <div class="toolbox-container">
          <h3>Toolbox (Flat)</h3>
          <Toolbox
            :available-blocks="demoBlocks"
            :group-by-category="false"
            @block-select="handleBlockSelect"
            @block-drag-start="handleBlockDragStart"
          />
        </div>
      </div>

      <div class="individual-blocks">
        <h3>Individual Code Blocks</h3>
        <div class="block-showcase">
          <div class="block-category">
            <h4>Variables</h4>
            <CodeBlock
              type="variable"
              value="x"
            />
            <CodeBlock
              type="variable"
              value="y"
            />
            <CodeBlock
              type="variable"
              value="p"
            />
          </div>
          
          <div class="block-category">
            <h4>Numbers</h4>
            <CodeBlock
              type="number"
              value="0"
            />
            <CodeBlock
              type="number"
              value="1"
            />
            <CodeBlock
              type="number"
              value="2"
            />
          </div>
          
          <div class="block-category">
            <h4>Operators</h4>
            <CodeBlock
              type="operator"
              value="="
            />
            <CodeBlock
              type="operator"
              value="=="
            />
            <CodeBlock
              type="operator"
              value="<"
            />
          </div>
          
          <div class="block-category">
            <h4>Colors</h4>
            <CodeBlock
              type="color"
              value="red"
            />
            <CodeBlock
              type="color"
              value="blue"
            />
            <CodeBlock
              type="color"
              value="green"
            />
          </div>
          
          <div class="block-category">
            <h4>Control</h4>
            <CodeBlock
              type="control"
              value="if"
            />
            <CodeBlock
              type="control"
              value="else"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Phase 4: Code Editor System -->
    <section class="demo-section">
      <h2>🏗️ Phase 4: Code Editor System (Completed)</h2>
      
      <div class="codeeditor-demo">
        <div class="editor-container">
          <CodeEditor
            :template="selectedTemplate"
            @structure-changed="handleCodeEditorStructureChanged"
            @code-executed="handleCodeExecuted"
            @grid-updated="handleGridUpdated"
            @evaluation-error="handleEvaluationError"
          />
        </div>
        
        <div class="phase5-demo">
          <p>✨ <strong>NEW: Phase 5 Complete!</strong></p>
          <ul>
            <li>✅ Real-time code evaluation engine</li>
            <li>✅ Live grid updates as you build code</li>
            <li>✅ Variable assignment (try: p = red)</li>
            <li>✅ Pattern generation from code structures</li>
          </ul>
          <p>🎯 <strong>Try it:</strong> Drag blocks to create "p = red" and watch the grid update in real-time!</p>
        </div>
      </div>
    </section>

    <!-- Development Info -->
    <footer class="playground-footer">
      <p>🛠️ Development Mode: Components update in real-time as you modify them</p>
      <p>📝 Check console for block interaction events</p>
    </footer>
  </div>
</template>

<style scoped>
.kodero-playground {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.playground-header {
  text-align: center;
  margin-bottom: 3rem;
}

.playground-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.playground-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.demo-section {
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.demo-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

/* Grid Demo Styles */
.grid-demo {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.grid-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 8px;
  border: 2px solid #e74c3c;
}

.grid-status {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.status-item {
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
}

.status-item.complete {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.demo-button {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.demo-button:hover {
  background-color: #0056b3;
}

/* Blocks Demo Styles */
.blocks-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.toolbox-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.toolbox-container h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #495057;
}

.individual-blocks {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.individual-blocks h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #495057;
}

.block-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.block-category {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.block-category h4 {
  margin: 0 0 0.75rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.block-category > :global(.code-block) {
  margin: 0.25rem;
}

/* Drag & Drop Demo Styles */
.dragdrop-demo {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-instruction {
  text-align: center;
  padding: 1.5rem;
  background-color: #e3f2fd;
  border-radius: 8px;
  border: 1px solid #bbdefb;
}

.demo-instruction p {
  margin: 0.5rem 0;
  color: #1565c0;
}

.slots-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slot-demo {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.slot-demo h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.slot-row {
  display: flex;
  gap: 1.5rem;
  align-items: end;
  flex-wrap: wrap;
}

.slot-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.slot-wrapper label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
}

/* Code Editor Demo Styles */
.codeeditor-demo {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.editor-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.editor-container :deep(.code-editor) {
  width: 100%;
  max-width: 800px;
}

/* Phase 5 Demo Styles */
.phase5-demo {
  text-align: center;
  padding: 2rem;
  background-color: #e8f5e8;
  border-radius: 8px;
  border: 2px solid #28a745;
}

.phase5-demo p {
  margin-bottom: 1rem;
  color: #155724;
  font-weight: 500;
}

.phase5-demo ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 1rem auto;
  color: #155724;
}

.phase5-demo li {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Coming Soon Styles */
.coming-soon {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
}

.coming-soon p {
  margin-bottom: 1rem;
  color: #6c757d;
}

.coming-soon ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  color: #6c757d;
}

.coming-soon li {
  margin-bottom: 0.5rem;
}

/* Footer Styles */
.playground-footer {
  text-align: center;
  padding: 2rem;
  background-color: #e9ecef;
  border-radius: 8px;
  margin-top: 2rem;
}

.playground-footer p {
  margin: 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .kodero-playground {
    padding: 1rem;
  }
  
  .demo-section {
    padding: 1rem;
  }
  
  .blocks-demo {
    grid-template-columns: 1fr;
  }
  
  .grid-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .grid-status {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .block-showcase {
    grid-template-columns: 1fr;
  }
  
  .slot-row {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .slot-wrapper {
    width: 100%;
    max-width: 200px;
  }
  
  
  .editor-container {
    padding: 0.5rem;
  }
  
  .editor-container :deep(.code-editor) {
    max-width: 100%;
  }
}
</style>
