<script setup lang="ts">
import { computed } from 'vue'
import type { BlockType, BlockValue } from '../types/codeBlocks'

interface Props {
  type: BlockType
  value: BlockValue
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Events
const emit = defineEmits<{
  click: [event: any]
  select: [block: { type: BlockType; value: BlockValue }]
}>()

// Computed properties
const blockClasses = computed(() => [
  'code-block',
  `code-block--${props.type}`,
  {
    'code-block--disabled': props.disabled,
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

const isDraggable = computed(() => !props.disabled)

const tabIndex = computed(() => props.disabled ? -1 : 0)

// Event handlers
function handleClick(event: any) {
  if (props.disabled) return
  emit('click', event)
}

function handleKeydown(event: any) {
  if (props.disabled) return
  
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', { type: props.type, value: props.value })
  }
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
    :draggable="isDraggable"
    :tabindex="tabIndex"
    @click="handleClick"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
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
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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