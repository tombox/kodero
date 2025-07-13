<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CodeSlot from './CodeSlot.vue'
import type { CodeStructure, CodeLine, CodeTemplateKey } from '../types/codeStructures'
import { CODE_TEMPLATES } from '../types/codeStructures'
import type { CodeBlock } from '../types/codeBlocks'

interface Props {
  template?: CodeTemplateKey
  structure?: CodeStructure
  disabled?: boolean
  maxLines?: number
}

const props = withDefaults(defineProps<Props>(), {
  template: 'EXPRESSION',
  disabled: false,
  maxLines: 10
})

// Events
const emit = defineEmits<{
  'structure-changed': [structure: CodeStructure]
  'block-placed': [lineId: string, slotId: string, block: CodeBlock]
  'block-removed': [lineId: string, slotId: string, block: CodeBlock]
  'code-executed': [result: any]
}>()

// Reactive state
const editorStructure = ref<CodeStructure>(
  props.structure || structuredClone(CODE_TEMPLATES[props.template])
)

// Watch for prop changes
watch(() => props.template, (newTemplate) => {
  if (newTemplate && !props.structure) {
    editorStructure.value = structuredClone(CODE_TEMPLATES[newTemplate])
    emit('structure-changed', editorStructure.value)
  }
})

watch(() => props.structure, (newStructure) => {
  if (newStructure) {
    try {
      editorStructure.value = structuredClone(newStructure)
    } catch (error) {
      // Fallback for non-cloneable objects in tests
      editorStructure.value = JSON.parse(JSON.stringify(newStructure))
    }
  }
})

// Computed properties
const isConditional = computed(() => 
  editorStructure.value && editorStructure.value.type === 'conditional'
)

const hasElse = computed(() => 
  isConditional.value && 
  editorStructure.value && 
  editorStructure.value.children && 
  editorStructure.value.children.length > 1
)

const ifBody = computed(() => 
  isConditional.value && editorStructure.value && editorStructure.value.children 
    ? editorStructure.value.children[0] : null
)

const elseBody = computed(() => 
  isConditional.value && 
  editorStructure.value && 
  editorStructure.value.children && 
  editorStructure.value.children.length > 1 
    ? editorStructure.value.children[1] : null
)

// Helper functions
function getSlotKey(lineId: string, slotIndex: number): string {
  return `${lineId}-slot-${slotIndex}`
}

function findLineById(structure: CodeStructure, lineId: string): CodeLine | null {
  // Search in main lines
  for (const line of structure.lines) {
    if (line.id === lineId) return line
  }
  
  // Search in children
  if (structure.children) {
    for (const child of structure.children) {
      const found = findLineById(child, lineId)
      if (found) return found
    }
  }
  
  return null
}

// Event handlers
function handleBlockDropped(lineId: string, slotIndex: number, blockData: CodeBlock) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return

  console.log(`Block dropped in CodeEditor: ${blockData.type}(${blockData.value}) -> ${lineId}[${slotIndex}]`)

  // Check if this block came from another slot in the editor and remove it
  removeBlockFromOtherSlots(blockData.id, lineId, slotIndex)

  // Place the block in the new slot
  line.placedBlocks[slotIndex] = blockData
  
  // Auto-grow: if this was the last slot and we're within maxSlots limit, add a new slot
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
  
  emit('block-placed', lineId, line.slots[slotIndex].id, blockData)
  emit('structure-changed', editorStructure.value)
}

function handleBlockRemoved(lineId: string, slotIndex: number, block: CodeBlock) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return

  console.log(`Block removed from CodeEditor: ${block.type}(${block.value}) from ${lineId}[${slotIndex}]`)
  
  line.placedBlocks[slotIndex] = null
  
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
}

function removeBlockFromOtherSlots(blockId: string, targetLineId: string, targetSlotIndex: number) {
  function searchAndRemove(structure: CodeStructure) {
    for (const line of structure.lines) {
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
    
    if (structure.children) {
      structure.children.forEach(searchAndRemove)
    }
  }
  
  searchAndRemove(editorStructure.value)
}

function addLine(targetStructure?: CodeStructure) {
  const structure = targetStructure || editorStructure.value
  
  if (structure.lines.length >= props.maxLines) {
    console.warn('Maximum lines reached')
    return
  }

  const newLine: CodeLine = {
    id: `line-${Date.now()}`,
    type: 'expression',
    slots: [
      { id: 'slot-0', placeholder: 'drop here' }
    ],
    placedBlocks: [null],
    minSlots: 1,
    maxSlots: 10
  }
  
  structure.lines.push(newLine)
  emit('structure-changed', editorStructure.value)
}

function addSlot(lineId: string) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return
  
  const maxSlots = line.maxSlots || 10
  if (line.slots.length >= maxSlots) {
    console.warn('Maximum slots reached for this line')
    return
  }
  
  const newSlotIndex = line.slots.length
  line.slots.push({
    id: `slot-${newSlotIndex}`,
    placeholder: 'drop here'
  })
  line.placedBlocks.push(null)
  
  console.log(`Added slot to line ${lineId}`)
  emit('structure-changed', editorStructure.value)
}

function removeSlot(lineId: string, slotIndex: number) {
  const line = findLineById(editorStructure.value, lineId)
  if (!line || props.disabled) return
  
  const minSlots = line.minSlots || 1
  if (line.slots.length <= minSlots) {
    console.warn('Cannot remove: minimum slots reached')
    return
  }
  
  line.slots.splice(slotIndex, 1)
  line.placedBlocks.splice(slotIndex, 1)
  
  console.log(`Removed slot ${slotIndex} from line ${lineId}`)
  emit('structure-changed', editorStructure.value)
}

function removeLine(lineId: string, targetStructure?: CodeStructure) {
  const structure = targetStructure || editorStructure.value
  const index = structure.lines.findIndex(line => line.id === lineId)
  
  if (index !== -1) {
    structure.lines.splice(index, 1)
    emit('structure-changed', editorStructure.value)
  }
  
  if (structure.children) {
    structure.children.forEach(child => removeLine(lineId, child))
  }
}

// Code execution
function executeCode() {
  // This will be implemented in Phase 5
  console.log('Code execution will be implemented in Phase 5')
  emit('code-executed', { structure: editorStructure.value })
}
</script>

<template>
  <div class="code-editor" :class="{ 'code-editor--disabled': disabled }">
    <div class="code-editor__header">
      <h3 class="code-editor__title">
        {{ template }} Code Structure
      </h3>
      <div class="code-editor__actions">
        <button 
          v-if="editorStructure && editorStructure.type === 'linear'"
          @click="addLine()"
          :disabled="disabled || editorStructure.lines.length >= maxLines"
          class="code-editor__btn code-editor__btn--add"
          title="Add line"
        >
          + Add Line
        </button>
        <button 
          @click="executeCode"
          :disabled="disabled"
          class="code-editor__btn code-editor__btn--execute"
          title="Execute code"
        >
          ▶ Run
        </button>
      </div>
    </div>

    <div class="code-editor__body">
      <!-- Main structure lines -->
      <div v-if="editorStructure && editorStructure.lines && editorStructure.lines.length > 0" class="code-lines">
        <div 
          v-for="line in editorStructure.lines" 
          :key="line.id"
          class="code-line"
          :class="`code-line--${line.type}`"
        >
          <div class="code-line__slots">
            <CodeSlot
              v-for="(slot, slotIndex) in line.slots"
              :key="getSlotKey(line.id, slotIndex)"
              :placed-block="line.placedBlocks[slotIndex]"
              :accepted-types="slot.acceptedTypes"
              :placeholder="slot.placeholder"
              :disabled="disabled"
              size="medium"
              @block-dropped="handleBlockDropped(line.id, slotIndex, $event)"
              @block-removed="handleBlockRemoved(line.id, slotIndex, $event)"
            />
          </div>
          
          <button 
            v-if="!disabled && editorStructure && editorStructure.type === 'linear' && editorStructure.lines.length > 1"
            @click="removeLine(line.id)"
            class="code-line__remove"
            title="Remove line"
          >
            ×
          </button>
        </div>
      </div>

      <!-- Conditional structure (if/else) -->
      <div v-if="isConditional" class="conditional-structure">
        <!-- If body -->
        <div v-if="ifBody" class="conditional-block conditional-block--if">
          <div class="conditional-block__header">
            <span class="conditional-block__label">Then:</span>
            <button 
              v-if="!disabled"
              @click="addLine(ifBody)"
              :disabled="ifBody.lines.length >= maxLines"
              class="code-editor__btn code-editor__btn--add code-editor__btn--small"
            >
              + Add
            </button>
          </div>
          
          <div class="code-lines code-lines--nested">
            <div 
              v-for="line in ifBody.lines" 
              :key="line.id"
              class="code-line code-line--nested"
              :class="`code-line--${line.type}`"
            >
              <div class="code-line__slots">
                <CodeSlot
                  v-for="(slot, slotIndex) in line.slots"
                  :key="getSlotKey(line.id, slotIndex)"
                  :placed-block="line.placedBlocks[slotIndex]"
                  :accepted-types="slot.acceptedTypes"
                  :placeholder="slot.placeholder"
                  :disabled="disabled"
                  size="medium"
                  @block-dropped="handleBlockDropped(line.id, slotIndex, $event)"
                  @block-removed="handleBlockRemoved(line.id, slotIndex, $event)"
                />
                
              </div>
              
              <button 
                v-if="!disabled && ifBody.lines.length > 1"
                @click="removeLine(line.id, ifBody)"
                class="code-line__remove"
                title="Remove line"
              >
                ×
              </button>
            </div>
            
            <div v-if="ifBody.lines.length === 0" class="code-lines__empty">
              <span class="code-lines__empty-text">Drop blocks here or click "Add" to create a line</span>
            </div>
          </div>
        </div>

        <!-- Else body -->
        <div v-if="hasElse && elseBody" class="conditional-block conditional-block--else">
          <div class="conditional-block__header">
            <span class="conditional-block__label">Else:</span>
            <button 
              v-if="!disabled"
              @click="addLine(elseBody)"
              :disabled="elseBody.lines.length >= maxLines"
              class="code-editor__btn code-editor__btn--add code-editor__btn--small"
            >
              + Add
            </button>
          </div>
          
          <div class="code-lines code-lines--nested">
            <div 
              v-for="line in elseBody.lines" 
              :key="line.id"
              class="code-line code-line--nested"
              :class="`code-line--${line.type}`"
            >
              <div class="code-line__slots">
                <CodeSlot
                  v-for="(slot, slotIndex) in line.slots"
                  :key="getSlotKey(line.id, slotIndex)"
                  :placed-block="line.placedBlocks[slotIndex]"
                  :accepted-types="slot.acceptedTypes"
                  :placeholder="slot.placeholder"
                  :disabled="disabled"
                  size="medium"
                  @block-dropped="handleBlockDropped(line.id, slotIndex, $event)"
                  @block-removed="handleBlockRemoved(line.id, slotIndex, $event)"
                />
                
              </div>
              
              <button 
                v-if="!disabled && elseBody.lines.length > 1"
                @click="removeLine(line.id, elseBody)"
                class="code-line__remove"
                title="Remove line"
              >
                ×
              </button>
            </div>
            
            <div v-if="elseBody.lines.length === 0" class="code-lines__empty">
              <span class="code-lines__empty-text">Drop blocks here or click "Add" to create a line</span>
            </div>
          </div>
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

.code-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.code-editor__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.code-editor__actions {
  display: flex;
  gap: 8px;
}

.code-editor__btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-editor__btn--add {
  background-color: #28a745;
  color: white;
}

.code-editor__btn--add:hover:not(:disabled) {
  background-color: #218838;
}

.code-editor__btn--execute {
  background-color: #007aff;
  color: white;
}

.code-editor__btn--execute:hover:not(:disabled) {
  background-color: #0056b3;
}

.code-editor__btn--small {
  padding: 4px 8px;
  font-size: 10px;
}

.code-editor__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.code-editor__body {
  padding: 16px;
}

.code-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-lines--nested {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 3px solid #007aff;
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

.code-line--nested {
  background-color: #f8f9fa;
}

.code-line--condition {
  background-color: #fff3cd;
  border-color: #ffeaa7;
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


.conditional-structure {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conditional-block {
  border: 2px solid #007aff;
  border-radius: 8px;
  overflow: hidden;
}

.conditional-block--if {
  border-color: #28a745;
}

.conditional-block--else {
  border-color: #ffc107;
}

.conditional-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #e3f2fd;
  border-bottom: 1px solid #bbdefb;
}

.conditional-block--if .conditional-block__header {
  background-color: #d4edda;
  border-bottom-color: #c3e6cb;
}

.conditional-block--else .conditional-block__header {
  background-color: #fff3cd;
  border-bottom-color: #ffeaa7;
}

.conditional-block__label {
  font-weight: 600;
  font-size: 14px;
  color: #495057;
}

.code-lines__empty {
  padding: 24px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.code-lines__empty-text {
  font-size: 14px;
}

/* Responsive design */
@media (max-width: 768px) {
  .code-editor__header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .code-editor__actions {
    justify-content: center;
  }
  
  .code-line {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .code-line__slots {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .code-lines--nested {
    margin-left: 12px;
    padding-left: 8px;
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