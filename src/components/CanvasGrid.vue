<script setup lang="ts">
import { computed, watch } from 'vue'
import GridCell from './GridCell.vue'

type Color = string

interface Props {
  grid?: Color[][]
}

const props = withDefaults(defineProps<Props>(), {
  grid: () => []
})

// Create default 5x5 gray grid if no grid provided or grid is empty
const defaultGrid = computed(() => {
  return Array(5).fill(null).map(() => Array(5).fill('gray'))
})

// Use provided grid or fall back to default
const currentGrid = computed(() => {
  console.log('CanvasGrid: props.grid:', props.grid)
  console.log('CanvasGrid: props.grid.length:', props.grid?.length)
  if (!props.grid || props.grid.length === 0) {
    console.log('CanvasGrid: Using default gray grid')
    return defaultGrid.value
  }
  console.log('CanvasGrid: Using provided grid')
  return props.grid
})

// Calculate grid dimensions
const gridDimensions = computed(() => {
  const rows = currentGrid.value.length
  const cols = rows > 0 ? currentGrid.value[0].length : 0
  return { rows, cols }
})

// Flatten grid for easy iteration
const flattenedGrid = computed(() => {
  const flattened = currentGrid.value.flat()
  console.log('CanvasGrid: flattenedGrid:', flattened)
  return flattened
})

// Grid label for accessibility
const gridLabel = computed(() => {
  const { rows, cols } = gridDimensions.value
  return `Canvas grid ${cols}x${rows}`
})

// Debug: Watch for prop changes
watch(() => props.grid, (newGrid, oldGrid) => {
  console.log('CanvasGrid: props.grid changed!')
  console.log('CanvasGrid: oldGrid:', oldGrid)
  console.log('CanvasGrid: newGrid:', newGrid)
}, { deep: true })
</script>

<template>
  <div
    class="canvas-grid"
    role="grid"
    :aria-label="gridLabel"
    :style="{
      '--grid-cols': gridDimensions.cols.toString(),
      '--grid-rows': gridDimensions.rows.toString()
    }"
  >

    <div class="grid-container">
      <GridCell
        v-for="(color, index) in flattenedGrid"
        :key="`cell-${index}-${color}`"
        :color="color"
        :data-debug="`index-${index}-color-${color}`"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-grid {
  padding: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
  gap: 4px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive grid sizing */
@media (max-width: 768px) {
  .canvas-grid {
    padding: 8px;
  }
  
  .grid-container {
    gap: 2px;
    padding: 4px;
  }
}
</style>