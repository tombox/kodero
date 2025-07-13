<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CodeSlot from './CodeSlot.vue'
import type { CodeStructure, CodeLine, CodeTemplateKey } from '../types/codeStructures'
import { CODE_TEMPLATES } from '../types/codeStructures'
import type { CodeBlock } from '../types/codeBlocks'
import { evaluationService } from '../evaluation'

interface Props {
  template?: CodeTemplateKey
  structure?: CodeStructure
  disabled?: boolean
  maxLines?: number
  enableEvaluation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  template: 'UNIFIED',
  disabled: false,
  maxLines: 10,
  enableEvaluation: true
})

// Events
const emit = defineEmits<{
  'structure-changed': [structure: CodeStructure]
  'block-placed': [lineId: string, slotId: string, block: CodeBlock]
  'block-removed': [lineId: string, slotId: string, block: CodeBlock]
  'code-executed': [result: any]
  'grid-updated': [grid: string[][]]
  'evaluation-error': [errors: any[]]
}>()

// Reactive state
const editorStructure = ref<CodeStructure>(
  props.structure || JSON.parse(JSON.stringify(CODE_TEMPLATES[props.template]))
)

// Watch for prop changes
watch(() => props.template, (newTemplate) => {
  if (newTemplate && !props.structure) {
    editorStructure.value = JSON.parse(JSON.stringify(CODE_TEMPLATES[newTemplate]))
    emit('structure-changed', editorStructure.value)
  }
})

watch(() => props.structure, (newStructure) => {
  if (newStructure) {
    try {
      editorStructure.value = JSON.parse(JSON.stringify(newStructure))
    } catch {
      // Fallback for non-cloneable objects in tests
      editorStructure.value = JSON.parse(JSON.stringify(newStructure))
    }
  }
})

// Computed properties
const allLines = computed(() => 
  editorStructure.value ? editorStructure.value.lines : []
)

// Helper functions
function getSlotKey(lineId: string, slotIndex: number): string {
  return `${lineId}-slot-${slotIndex}`
}

function findLineById(structure: CodeStructure, lineId: string): CodeLine | null {
  return structure.lines.find(line => line.id === lineId) || null
}

// Event handlers
function handleBlockDropped(lineId: string, slotIndex: number, blockData: CodeBlock) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return

  console.log(`Block dropped in CodeEditor: ${blockData.type}(${blockData.value}) -> ${lineId}[${slotIndex}]`)

  // Create a unique copy of the block for the editor to avoid ID conflicts
  const uniqueBlock: CodeBlock = {
    ...blockData,
    id: `placed-${lineId}-${slotIndex}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Check if this block came from another slot in the editor and remove it
  // Only do this if the original block ID suggests it's already placed (starts with 'placed-')
  if (blockData.id.startsWith('placed-')) {
    removeBlockFromOtherSlots(blockData.id, lineId, slotIndex)
  }

  // Place the unique block in the new slot
  line.placedBlocks[slotIndex] = uniqueBlock
  
  // Auto-grow slots: if this was the last slot and we're within maxSlots limit, add a new slot
  const maxSlots = line.maxSlots || 10
  if (slotIndex === line.slots.length - 1 && line.slots.length < maxSlots) {
    const newSlotIndex = line.slots.length
    line.slots.push({
      id: `slot-${newSlotIndex}`,
      placeholder: 'drop here'
    })
    line.placedBlocks.push(null)
    console.log(`Auto-added slot ${newSlotIndex} to line ${lineId}`)
  }
  
  // Auto-add new line: if this is the first block on an empty line, add next line
  const isFirstBlockOnLine = line.placedBlocks.filter(block => block !== null).length === 1
  if (isFirstBlockOnLine) {
    addNextLine(lineId)
  }
  
  // Auto-indent: if this is a control block (if/else), add indented child line
  if (blockData.type === 'control' && (blockData.value === 'if' || blockData.value === 'else')) {
    addIndentedLine(lineId)
  }
  
  emit('block-placed', lineId, line.slots[slotIndex].id, uniqueBlock)
  emit('structure-changed', editorStructure.value)
  
  // NEW: Trigger real-time evaluation
  if (props.enableEvaluation) {
    executeCode()
  }
}

function handleBlockRemoved(lineId: string, slotIndex: number, block: CodeBlock) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return

  console.log(`Block removed from CodeEditor: ${block.type}(${block.value}) from ${lineId}[${slotIndex}]`)
  
  line.placedBlocks[slotIndex] = null
  
  // Auto-cleanup: if this was a control block (if/else), remove its indented child lines
  if (block.type === 'control' && (block.value === 'if' || block.value === 'else')) {
    removeIndentedChildLines(lineId)
  }
  
  // Auto-shrink: remove trailing empty slots but keep at least minSlots
  const minSlots = line.minSlots || 1
  while (line.slots.length > minSlots) {
    const lastIndex = line.slots.length - 1
    // If the last slot is empty and the second-to-last slot is also empty, remove the last slot
    if (!line.placedBlocks[lastIndex] && !line.placedBlocks[lastIndex - 1]) {
      line.slots.splice(lastIndex, 1)
      line.placedBlocks.splice(lastIndex, 1)
      console.log(`Auto-removed empty slot ${lastIndex} from line ${lineId}`)
    } else {
      break
    }
  }
  
  emit('block-removed', lineId, line.slots[slotIndex].id, block)
  emit('structure-changed', editorStructure.value)
  
  // NEW: Trigger real-time evaluation
  if (props.enableEvaluation) {
    executeCode()
  }
}

function removeBlockFromOtherSlots(blockId: string, targetLineId: string, targetSlotIndex: number) {
  for (const line of editorStructure.value.lines) {
    for (let i = 0; i < line.placedBlocks.length; i++) {
      const block = line.placedBlocks[i]
      if (block && block.id === blockId) {
        // Don't remove from the target slot
        if (line.id === targetLineId && i === targetSlotIndex) continue
        
        console.log(`Moving block from ${line.id}[${i}] to ${targetLineId}[${targetSlotIndex}]`)
        line.placedBlocks[i] = null
      }
    }
  }
}

// Remove all indented child lines that belong to a parent control line
function removeIndentedChildLines(parentLineId: string) {
  const structure = editorStructure.value
  const parentLine = findLineById(structure, parentLineId)
  if (!parentLine) return
  
  const childLinesToRemove: string[] = []
  
  // Find all lines that have this line as their parent (direct children)
  for (const line of structure.lines) {
    if (line.parentLineId === parentLineId) {
      childLinesToRemove.push(line.id)
    }
  }
  
  // Recursively find and remove grandchildren, great-grandchildren, etc.
  for (const childLineId of childLinesToRemove) {
    removeIndentedChildLines(childLineId) // Recursive call for nested children
  }
  
  // Remove all collected child lines
  for (const childLineId of childLinesToRemove) {
    const index = structure.lines.findIndex(line => line.id === childLineId)
    if (index !== -1) {
      structure.lines.splice(index, 1)
      console.log(`Auto-removed indented child line ${childLineId} (parent: ${parentLineId})`)
    }
  }
}

// Add next line at same indent level
function addNextLine(afterLineId: string) {
  const structure = editorStructure.value
  if (structure.lines.length >= props.maxLines) {
    console.warn('Maximum lines reached')
    return
  }

  const afterLine = findLineById(structure, afterLineId)
  if (!afterLine) return

  // Find the last line that belongs to this block (including indented children)
  const afterIndex = structure.lines.findIndex(line => line.id === afterLineId)
  let insertIndex = afterIndex + 1
  
  // Look for any existing child lines that belong to this parent
  // and insert the new line after the last child
  for (let i = afterIndex + 1; i < structure.lines.length; i++) {
    const line = structure.lines[i]
    // If this line is a direct child of the afterLine, update insert position
    if (line.parentLineId === afterLineId) {
      insertIndex = i + 1
    } else if (line.indentLevel <= afterLine.indentLevel) {
      // If we hit a line at the same or lower indent level, stop looking
      break
    }
  }
  
  // Determine the correct indent level for the next line
  // If afterLine is unindented (level 0), new line should also be unindented
  // If afterLine is indented, we need to check if it's a control structure or regular statement
  let newIndentLevel = afterLine.indentLevel
  let newParentLineId = afterLine.parentLineId
  
  // If the afterLine contains an 'else' block, the next line should be at the same level as the 'if'
  // that this else belongs to, not the else itself
  const hasElseBlock = afterLine.placedBlocks.some(block => 
    block && block.type === 'control' && block.value === 'else'
  )
  
  if (hasElseBlock) {
    // For else lines, find the corresponding if line and use its level/parent
    // Look backwards to find the matching if at the same level
    for (let i = afterIndex - 1; i >= 0; i--) {
      const prevLine = structure.lines[i]
      if (prevLine.indentLevel === afterLine.indentLevel && 
          prevLine.parentLineId === afterLine.parentLineId) {
        const hasIfBlock = prevLine.placedBlocks.some(block => 
          block && block.type === 'control' && block.value === 'if'
        )
        if (hasIfBlock) {
          newIndentLevel = prevLine.indentLevel
          newParentLineId = prevLine.parentLineId
          break
        }
      }
    }
  }

  const newLine: CodeLine = {
    id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'expression',
    indentLevel: newIndentLevel,
    parentLineId: newParentLineId,
    slots: [
      { id: 'slot-0', placeholder: 'drop here' }
    ],
    placedBlocks: [null],
    minSlots: 1,
    maxSlots: 10
  }
  
  // Insert after the last child line (or after the current line if no children)
  structure.lines.splice(insertIndex, 0, newLine)
  console.log(`Auto-added next line after ${afterLineId} and children at indent level ${newIndentLevel}`)
  emit('structure-changed', editorStructure.value)
}

// Add indented child line
function addIndentedLine(parentLineId: string) {
  const structure = editorStructure.value
  if (structure.lines.length >= props.maxLines) {
    console.warn('Maximum lines reached')
    return
  }

  const parentLine = findLineById(structure, parentLineId)
  if (!parentLine) return

  const parentIndex = structure.lines.findIndex(line => line.id === parentLineId)
  
  const newLine: CodeLine = {
    id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'expression',
    indentLevel: parentLine.indentLevel + 1, // One level deeper
    parentLineId: parentLineId,
    slots: [
      { id: 'slot-0', placeholder: 'drop here' }
    ],
    placedBlocks: [null],
    minSlots: 1,
    maxSlots: 10
  }
  
  // Insert after the parent line
  structure.lines.splice(parentIndex + 1, 0, newLine)
  console.log(`Auto-added indented line under ${parentLineId} at indent level ${newLine.indentLevel}`)
  emit('structure-changed', editorStructure.value)
}

// Legacy function for manual line adding (now simplified)
function addLine() {
  if (allLines.value.length === 0) return
  addNextLine(allLines.value[allLines.value.length - 1].id)
}

function removeLine(lineId: string) {
  const structure = editorStructure.value
  const lineToRemove = findLineById(structure, lineId)
  
  if (!lineToRemove) return
  
  // Check if this line has any control blocks - if so, clean up its child lines
  const hasControlBlocks = lineToRemove.placedBlocks.some(block => 
    block && block.type === 'control' && (block.value === 'if' || block.value === 'else')
  )
  
  if (hasControlBlocks) {
    removeIndentedChildLines(lineId)
  }
  
  const index = structure.lines.findIndex(line => line.id === lineId)
  if (index !== -1) {
    structure.lines.splice(index, 1)
    console.log(`Removed line ${lineId} and its child lines`)
    emit('structure-changed', editorStructure.value)
    
    // NEW: Trigger real-time evaluation after line removal
    if (props.enableEvaluation) {
      executeCode()
    }
  }
}

// Code execution
function executeCode() {
  try {
    // Evaluate the current structure using the evaluation service
    const result = evaluationService.evaluate(editorStructure.value, { width: 5, height: 5 })
    
    if (result.success && result.grid) {
      console.log('Code evaluation successful:', result.grid)
      emit('grid-updated', result.grid)
      emit('code-executed', { 
        structure: editorStructure.value, 
        grid: result.grid,
        success: true
      })
    } else {
      console.warn('Code evaluation failed:', result.errors, result.parseErrors)
      emit('evaluation-error', [...(result.errors || []), ...(result.parseErrors || [])])
      emit('code-executed', { 
        structure: editorStructure.value, 
        success: false,
        errors: result.errors,
        parseErrors: result.parseErrors
      })
    }
  } catch (error) {
    console.error('Code evaluation error:', error)
    emit('evaluation-error', [{ message: error instanceof Error ? error.message : 'Unknown error' }])
    emit('code-executed', { 
      structure: editorStructure.value, 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Expose functions for external access (tests, etc.)
defineExpose({
  executeCode,
  handleBlockDropped,
  handleBlockRemoved,
  addLine,
  removeLine,
  allLines
})
</script>

<template>
  <div
    class="code-editor"
    :class="{ 'code-editor--disabled': disabled }"
  >
    <div class="code-editor__body">
      <!-- Unified line structure with auto-indenting -->
      <div
        v-if="allLines.length > 0"
        class="code-lines"
      >
        <div 
          v-for="line in allLines" 
          :key="line.id"
          class="code-line"
          :class="[
            `code-line--${line.type}`,
            `code-line--indent-${line.indentLevel}`,
            { 'code-line--indented': line.indentLevel > 0 }
          ]"
        >
          <div class="code-line__slots">
            <CodeSlot
              v-for="(slot, slotIndex) in line.slots"
              :key="getSlotKey(line.id, slotIndex)"
              :placed-block="line.placedBlocks[slotIndex] || undefined"
              :accepted-types="slot.acceptedTypes"
              :placeholder="slot.placeholder"
              :disabled="disabled"
              size="medium"
              @block-dropped="handleBlockDropped(line.id, slotIndex, $event)"
              @block-removed="handleBlockRemoved(line.id, slotIndex, $event)"
            />
          </div>
          
          <button 
            v-if="!disabled && allLines.length > 1"
            class="code-line__remove"
            title="Remove line"
            @click="removeLine(line.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-editor {
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  font-family: 'Monaco', 'Menlo', monospace;
}

.code-editor--disabled {
  opacity: 0.6;
  pointer-events: none;
}


.code-editor__body {
  padding: 4px;
}

.code-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-line {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.code-line:hover {
  border-color: #007aff;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

/* Indentation styles */
.code-line--indent-1 {
  margin-left: 24px;
}

.code-line--indent-2 {
  margin-left: 48px;
}

.code-line--indent-3 {
  margin-left: 72px;
}

.code-line--indent-4 {
  margin-left: 96px;
}

.code-line--indented {
  background-color: #f8f9fa;
  border-left: 3px solid #007aff;
}

.code-line--assignment {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.code-line__slots {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.code-line__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.code-line__remove:hover {
  background-color: #c82333;
  transform: scale(1.1);
}


/* Responsive design */
@media (max-width: 768px) {
  .code-line {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .code-line__slots {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .code-line--indent-1 {
    margin-left: 12px;
  }
  
  .code-line--indent-2 {
    margin-left: 24px;
  }
  
  .code-line--indent-3 {
    margin-left: 36px;
  }
  
  .code-line--indent-4 {
    margin-left: 48px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .code-editor {
    border-width: 3px;
  }
  
  .code-line {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .code-editor,
  .code-line,
  .code-editor__btn,
  .code-line__remove {
    transition: none;
  }
  
  .code-line__remove:hover {
    transform: none;
  }
}
</style>