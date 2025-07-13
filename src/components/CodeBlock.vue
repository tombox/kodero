<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlockType, BlockValue } from '../types/codeBlocks'

interface Props {
  type: BlockType
  value: BlockValue
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Reactive state for drag behavior
const isDragging = ref(false)
const blockId = ref(props.id || `code-block-${props.type}-${props.value}-${Date.now()}`)

// Events
const emit = defineEmits<{
  click: [event: any]
  select: [block: { type: BlockType; value: BlockValue }]
  dragstart: [event: any]
  dragend: [event: any]
  'drag-keyboard-start': [block: { type: BlockType; value: BlockValue }]
}>()

// Computed properties
const blockClasses = computed(() => [
  'code-block',
  `code-block--${props.type}`,
  {
    'code-block--disabled': props.disabled,
    'code-block--draggable': !props.disabled,
    'code-block--dragging': isDragging.value,
    'code-block--focused': false // Will be managed by focus state
  }
])

const blockStyle = computed(() => {
  const style: Record<string, string> = {}
  
  // Apply color-specific styling for color blocks
  if (props.type === 'color') {
    style['--block-color'] = props.value as string
  }
  
  return style
})

const ariaLabel = computed(() => {
  return `Code block: ${props.type} ${props.value}`
})

const isDraggable = computed(() => props.disabled ? 'false' : 'true')

const tabIndex = computed(() => props.disabled ? -1 : 0)

const ariaGrabbed = computed(() => isDragging.value ? 'true' : 'false')

// Event handlers
function handleClick(event: any) {
  if (props.disabled) return
  emit('click', event)
}

function handleMouseDown(event: any) {
  // Don't prevent default - let the browser handle drag initiation
}

function handleKeydown(event: any) {
  if (props.disabled) return
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', { type: props.type, value: props.value })
  }
  
  // Keyboard drag initiation
  if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    emit('drag-keyboard-start', { type: props.type, value: props.value })
  }
}

function handleDragStart(event: any) {
  if (props.disabled) {
    event.preventDefault()
    return
  }
  
  isDragging.value = true

  const blockData = {
    id: blockId.value,
    type: props.type,
    value: props.value,
    timestamp: Date.now()
  }

  // Set drag data in multiple formats for compatibility
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(blockData))
    event.dataTransfer.setData('text/plain', String(props.value))
    event.dataTransfer.effectAllowed = 'copy'
    
    // Use the element itself as drag image with offset (browser only)
    if (typeof event.dataTransfer.setDragImage === 'function') {
      event.dataTransfer.setDragImage(event.target, 20, 15)
    }
  }

  // Emit custom event with block data
  emit('dragstart', {
    ...event,
    blockData
  })
}

function handleDragEnd(event: any) {
  isDragging.value = false
  emit('dragend', event)
}

function handleFocus() {
  // Add focus class for styling
  if (!props.disabled) {
    document.activeElement?.classList.add('code-block--focused')
  }
}

function handleBlur() {
  // Remove focus class
  document.activeElement?.classList.remove('code-block--focused')
}
</script>

<template>
  <div
    :class="blockClasses"
    :style="blockStyle"
    role="button"
    :aria-label="ariaLabel"
    :aria-disabled="disabled"
    :aria-grabbed="ariaGrabbed"
    :draggable="!disabled"
    :tabindex="tabIndex"
    @click="handleClick"
    @keydown="handleKeydown"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @focus="handleFocus"
    @blur="handleBlur"
    @mousedown="handleMouseDown"
  >
    <span class="code-block__content">
      {{ value }}
    </span>
  </div>
</template>

<style scoped>
.code-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 32px;
  padding: 4px 12px;
  border-radius: 8px;
  border: 2px solid transparent;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: element;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* touch-action: none; - removed as it can interfere with dragging */
}

.code-block:hover:not(.code-block--disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.code-block:active:not(.code-block--disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.code-block--focused {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}

/* Type-specific styling */
.code-block--variable {
  background-color: #ff9500;
  color: white;
  border-color: #e6851a;
}

.code-block--number {
  background-color: white;
  color: #333;
  border-color: #ddd;
}

.code-block--operator {
  background-color: #4cd964;
  color: white;
  border-color: #43c454;
}

.code-block--color {
  background-color: var(--block-color);
  color: white;
  border-color: rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.code-block--control {
  background-color: #ffcc00;
  color: #333;
  border-color: #e6b800;
}

/* Disabled state */
.code-block--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Drag states */
.code-block--draggable {
  cursor: grab;
}

.code-block--draggable:active {
  cursor: grabbing;
}

.code-block--dragging {
  opacity: 0.7;
  transform: rotate(2deg);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  /* Removed pointer-events: none as it breaks dragging */
}

.code-block__content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive design */
@media (max-width: 768px) {
  .code-block {
    min-width: 36px;
    height: 28px;
    padding: 2px 8px;
    font-size: 12px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .code-block {
    border-width: 3px;
  }
  
  .code-block--focused {
    outline-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .code-block {
    transition: none;
  }
  
  .code-block:hover:not(.code-block--disabled) {
    transform: none;
  }
}
</style>