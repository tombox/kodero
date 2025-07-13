<script setup lang="ts">
import { computed } from 'vue'
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
  if (!props.grid || props.grid.length === 0) {
    return defaultGrid.value
  }
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
  return currentGrid.value.flat()
})

// Grid label for accessibility
const gridLabel = computed(() => {
  const { rows, cols } = gridDimensions.value
  return `Canvas grid ${cols}x${rows}`
})
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
        :key="index"
        :color="color"
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