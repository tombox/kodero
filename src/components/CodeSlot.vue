<script setup lang="ts">
import { ref, computed } from 'vue'
import CodeBlock from './CodeBlock.vue'
import type { CodeBlock as CodeBlockType, BlockType } from '../types/codeBlocks'

interface Props {
  placedBlock?: CodeBlockType
  acceptedTypes?: BlockType[]
  placeholder?: string
  disabled?: boolean
  showTypeIndicator?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showTypeIndicator: false,
  size: 'medium'
})

// Reactive state
const isDragOver = ref(false)

// Events
const emit = defineEmits<{
  'block-dropped': [blockData: any]
  'block-removed': [block: CodeBlockType]
  'drop-rejected': [reason: string]
  'activate': []
}>()

// Computed properties
const slotClasses = computed(() => [
  'code-slot',
  `code-slot--${props.size}`,
  {
    'code-slot--empty': !props.placedBlock,
    'code-slot--filled': !!props.placedBlock,
    'code-slot--disabled': props.disabled,
    'code-slot--drag-over': isDragOver.value && !props.disabled
  }
])

const ariaLabel = computed(() => {
  if (props.placedBlock) {
    return `Code slot containing ${props.placedBlock.type} ${props.placedBlock.value}`
  }
  return props.placeholder || 'Empty code slot ready for drop'
})

const tabIndex = computed(() => props.disabled ? -1 : 0)

// Event handlers
function handleDragOver(event: any) {
  if (props.disabled) return
  
  if (event.preventDefault) {
    event.preventDefault()
  }
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  isDragOver.value = true
}

function handleDragEnter(event: any) {
  if (props.disabled) return
  
  if (event.preventDefault) {
    event.preventDefault()
  }
  isDragOver.value = true
}

function handleDragLeave(event: any) {
  if (props.disabled) return
  
  isDragOver.value = false
}

function handleDrop(event: any) {
  if (props.disabled) return
  
  if (event.preventDefault) {
    event.preventDefault()
  }
  isDragOver.value = false
  
  try {
    const rawData = event.dataTransfer?.getData('application/json')
    if (!rawData) {
      emit('drop-rejected', 'No data available')
      return
    }
    
    const blockData = JSON.parse(rawData)
    
    // Validate block type if restrictions are set
    if (props.acceptedTypes && props.acceptedTypes.length > 0) {
      if (!props.acceptedTypes.includes(blockData.type)) {
        emit('drop-rejected', `Block type ${blockData.type} not accepted`)
        return
      }
    }
    
    emit('block-dropped', blockData)
  } catch (error) {
    emit('drop-rejected', 'Invalid drop data format')
  }
}

function handleRemoveBlock() {
  if (props.disabled || !props.placedBlock) return
  
  emit('block-removed', props.placedBlock)
}

function handleKeydown(event: any) {
  if (props.disabled) return
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('activate')
  }
  
  if ((event.key === 'Delete' || event.key === 'Backspace') && props.placedBlock) {
    event.preventDefault()
    handleRemoveBlock()
  }
}
</script>

<template>
  <div
    :class="slotClasses"
    role="button"
    :aria-label="ariaLabel"
    :aria-dropeffect="disabled ? 'none' : 'copy'"
    :tabindex="tabIndex"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @keydown="handleKeydown"
  >
    <!-- Type indicator -->
    <div 
      v-if="showTypeIndicator && acceptedTypes && acceptedTypes.length > 0"
      class="code-slot__type-indicator"
    >
      {{ acceptedTypes.join(', ') }}
    </div>
    
    <!-- Placed block or placeholder -->
    <div v-if="placedBlock" class="code-slot__content">
      <CodeBlock
        :id="placedBlock.id"
        :type="placedBlock.type"
        :value="placedBlock.value"
        :disabled="disabled"
      />
      <button
        v-if="!disabled"
        class="code-slot__remove"
        @click="handleRemoveBlock"
        aria-label="Remove block"
      >
        ×
      </button>
    </div>
    
    <div v-else-if="placeholder" class="code-slot__placeholder">
      {{ placeholder }}
    </div>
  </div>
</template>

<style scoped>
.code-slot {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 60px;
  padding: 4px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  cursor: pointer;
  box-sizing: border-box;
}

.code-slot:hover:not(.code-slot--disabled) {
  border-color: #007aff;
  background-color: #f0f8ff;
}

.code-slot:focus {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}

/* Size variants */
.code-slot--small {
  width: 60px;
  height: 48px;
  padding: 4px;
}

.code-slot--large {
  width: 100px;
  height: 72px;
  padding: 4px;
}

/* State variants */
.code-slot--empty {
  border-style: dashed;
}

.code-slot--filled {
  border-style: solid;
  border-color: #28a745;
  background-color: white;
}

.code-slot--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.code-slot--drag-over {
  border-color: #007aff;
  background-color: #e3f2fd;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
}

/* Content styles */
.code-slot__content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: visible; /* Allow remove button to show outside */
}

.code-slot__content :deep(.code-block) {
  flex-shrink: 0; /* Allow CodeBlock to maintain its natural size */
}

.code-slot__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.code-slot__remove:hover {
  background-color: #c82333;
  transform: scale(1.1);
}

.code-slot__placeholder {
  color: #6c757d;
  font-size: 12px;
  text-align: center;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.code-slot__type-indicator {
  position: absolute;
  top: -10px;
  left: 8px;
  background-color: #495057;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 5;
}

/* Responsive design */
@media (max-width: 768px) {
  .code-slot {
    width: 70px;
    height: 52px;
    padding: 4px;
  }
  
  .code-slot--small {
    width: 55px;
    height: 44px;
    padding: 4px;
  }
  
  .code-slot--large {
    width: 85px;
    height: 64px;
    padding: 4px;
  }
  
  .code-slot__remove {
    width: 16px;
    height: 16px;
    font-size: 10px;
    top: -5px;
    right: -5px;
  }
  
  .code-slot__placeholder {
    font-size: 10px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .code-slot {
    border-width: 3px;
  }
  
  .code-slot:focus {
    outline-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .code-slot {
    transition: none;
  }
  
  .code-slot--drag-over {
    transform: none;
  }
  
  .code-slot__remove:hover {
    transform: none;
  }
}
</style>