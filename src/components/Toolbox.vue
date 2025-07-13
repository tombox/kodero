<script setup lang="ts">
import { computed, ref } from 'vue'
import CodeBlock from './CodeBlock.vue'
import type { CodeBlock as CodeBlockType, BlockType } from '../types/codeBlocks'
import { BLOCK_CATEGORIES } from '../types/codeBlocks'

interface Props {
  availableBlocks: CodeBlockType[]
  groupByCategory?: boolean
  searchable?: boolean
  allowedTypes?: BlockType[]
  dragDisabled?: boolean
  multiSelect?: boolean
  compact?: boolean
  maxVisibleBlocks?: number
}

const props = withDefaults(defineProps<Props>(), {
  groupByCategory: false,
  searchable: false,
  allowedTypes: undefined,
  dragDisabled: false,
  multiSelect: false,
  compact: false,
  maxVisibleBlocks: undefined
})

// Events
const emit = defineEmits<{
  'block-select': [block: CodeBlockType]
  'block-drag-start': [block: CodeBlockType]
  'blocks-filter': [filteredBlocks: CodeBlockType[]]
}>()

// Reactive state
const searchTerm = ref('')
const selectedBlocks = ref<Set<string>>(new Set())

// Computed properties
const filteredBlocks = computed(() => {
  let blocks = props.availableBlocks

  // Filter by allowed types
  if (props.allowedTypes && props.allowedTypes.length > 0) {
    blocks = blocks.filter(block => props.allowedTypes!.includes(block.type))
  }

  // Filter by search term
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    blocks = blocks.filter(block => 
      block.value.toString().toLowerCase().includes(term) ||
      block.type.toLowerCase().includes(term)
    )
  }

  // Limit visible blocks in compact mode
  if (props.compact && props.maxVisibleBlocks) {
    blocks = blocks.slice(0, props.maxVisibleBlocks)
  }

  return blocks
})

const blocksByCategory = computed(() => {
  if (!props.groupByCategory) return null

  const grouped = new Map<BlockType, CodeBlockType[]>()
  
  filteredBlocks.value.forEach(block => {
    if (!grouped.has(block.type)) {
      grouped.set(block.type, [])
    }
    grouped.get(block.type)!.push(block)
  })

  return grouped
})

const hasBlocks = computed(() => filteredBlocks.value.length > 0)

const toolboxClasses = computed(() => [
  'toolbox',
  {
    'toolbox--compact': props.compact,
    'toolbox--searchable': props.searchable,
    'toolbox--grouped': props.groupByCategory
  }
])

// Event handlers
function handleBlockClick(block: CodeBlockType, event: any) {
  if (props.dragDisabled) return

  if (props.multiSelect && (event.ctrlKey || event.metaKey)) {
    // Toggle selection in multi-select mode
    if (selectedBlocks.value.has(block.id)) {
      selectedBlocks.value.delete(block.id)
    } else {
      selectedBlocks.value.add(block.id)
    }
  } else {
    // Single selection
    selectedBlocks.value.clear()
    selectedBlocks.value.add(block.id)
  }

  emit('block-select', block)
}

function handleBlockDragStart(block: CodeBlockType, event: any) {
  if (props.dragDisabled) {
    event.preventDefault()
    return
  }

  // Set drag data
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(block))
    event.dataTransfer.effectAllowed = 'copy'
  }

  emit('block-drag-start', block)
}

function handleKeydown(event: any) {
  // Handle keyboard navigation
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    // Focus management would be implemented here
    event.preventDefault()
  }
}

function handleSearchInput() {
  emit('blocks-filter', filteredBlocks.value)
}

function getCategoryName(type: BlockType): string {
  return BLOCK_CATEGORIES[type].name
}

function isBlockSelected(blockId: string): boolean {
  return selectedBlocks.value.has(blockId)
}
</script>

<template>
  <div
    :class="toolboxClasses"
    role="toolbar"
    aria-label="Code block toolbox"
    tabindex="0"
    @keydown="handleKeydown"
  >
    <!-- Toolbox Header -->
    <div class="toolbox__header">
      <h3 class="toolbox__title">
        Toolbox
      </h3>
      
      <!-- Search Input -->
      <div
        v-if="searchable"
        class="toolbox__search"
      >
        <input
          v-model="searchTerm"
          type="search"
          placeholder="Search blocks..."
          aria-label="Search code blocks"
          @input="handleSearchInput"
        >
      </div>
    </div>

    <!-- Blocks Container -->
    <div class="toolbox__content">
      <!-- Grouped by Category -->
      <div
        v-if="groupByCategory && blocksByCategory"
        class="toolbox__categories"
      >
        <div
          v-for="[type, blocks] in blocksByCategory"
          :key="type"
          class="toolbox__category"
        >
          <div class="toolbox__category-header">
            <h4>{{ getCategoryName(type) }}</h4>
            <span class="toolbox__category-count">{{ blocks.length }}</span>
          </div>
          
          <div class="toolbox__category-blocks">
            <CodeBlock
              v-for="block in blocks"
              :key="block.id"
              :type="block.type"
              :value="block.value"
              :disabled="dragDisabled"
              :class="{
                'code-block--selected': isBlockSelected(block.id)
              }"
              @click="handleBlockClick(block, $event)"
              @dragstart="handleBlockDragStart(block, $event)"
            />
          </div>
        </div>
      </div>

      <!-- Flat Layout -->
      <div
        v-else-if="hasBlocks"
        class="toolbox__blocks"
      >
        <CodeBlock
          v-for="block in filteredBlocks"
          :key="block.id"
          :type="block.type"
          :value="block.value"
          :disabled="dragDisabled"
          :class="{
            'code-block--selected': isBlockSelected(block.id)
          }"
          @click="handleBlockClick(block, $event)"
          @dragstart="handleBlockDragStart(block, $event)"
        />
      </div>

      <!-- Empty States -->
      <div
        v-else-if="searchTerm && !hasBlocks"
        class="toolbox__no-results"
      >
        <p>No blocks found for "{{ searchTerm }}"</p>
        <button
          class="toolbox__clear-search"
          @click="searchTerm = ''"
        >
          Clear search
        </button>
      </div>

      <div
        v-else
        class="toolbox__empty"
      >
        <p>No blocks available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbox {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  max-height: 400px;
  overflow: hidden;
}

.toolbox:focus {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}

.toolbox__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.toolbox__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.toolbox__search {
  flex: 1;
  max-width: 200px;
  margin-left: 16px;
}

.toolbox__search input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.toolbox__search input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.toolbox__content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.toolbox__categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbox__category {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
}

.toolbox__category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.toolbox__category-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
}

.toolbox__category-count {
  font-size: 12px;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 12px;
}

.toolbox__category-blocks,
.toolbox__blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbox__empty,
.toolbox__no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
  color: #6c757d;
}

.toolbox__empty p,
.toolbox__no-results p {
  margin: 0 0 12px 0;
  font-size: 14px;
}

.toolbox__clear-search {
  padding: 6px 12px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toolbox__clear-search:hover {
  background-color: #0056b3;
}

/* Selected block styling */
.code-block--selected {
  outline: 2px solid #007aff;
  outline-offset: 2px;
}

/* Compact mode */
.toolbox--compact {
  max-height: 300px;
  padding: 12px;
}

.toolbox--compact .toolbox__title {
  font-size: 14px;
}

.toolbox--compact .toolbox__category-blocks,
.toolbox--compact .toolbox__blocks {
  gap: 6px;
}

/* Responsive design */
@media (max-width: 768px) {
  .toolbox {
    padding: 12px;
    max-height: 250px;
  }
  
  .toolbox__header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .toolbox__search {
    max-width: none;
    margin-left: 0;
  }
  
  .toolbox__category-blocks,
  .toolbox__blocks {
    gap: 6px;
  }
}

/* Scrollbar styling */
.toolbox__content::-webkit-scrollbar {
  width: 6px;
}

.toolbox__content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.toolbox__content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.toolbox__content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>