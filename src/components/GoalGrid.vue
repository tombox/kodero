<script setup lang="ts">
import { computed } from 'vue'
import GridCell from './GridCell.vue'

type Color = string

interface Props {
  goalGrid: Color[][]
}

const props = defineProps<Props>()

// Calculate grid dimensions
const gridDimensions = computed(() => {
  if (!props.goalGrid || props.goalGrid.length === 0) {
    return { rows: 0, cols: 0 }
  }
  const rows = props.goalGrid.length
  const cols = rows > 0 ? props.goalGrid[0].length : 0
  return { rows, cols }
})

// Flatten grid for easy iteration
const flattenedGrid = computed(() => {
  if (!props.goalGrid || props.goalGrid.length === 0) {
    return []
  }
  return props.goalGrid.flat()
})

// Grid label for accessibility
const gridLabel = computed(() => {
  const { rows, cols } = gridDimensions.value
  return `Goal pattern ${cols}x${rows}`
})

// Check if goal is set
const hasGoal = computed(() => {
  return props.goalGrid && props.goalGrid.length > 0
})
</script>

<template>
  <div
    class="goal-grid"
    role="grid"
    :aria-label="gridLabel"
    :style="{
      '--grid-cols': gridDimensions.cols.toString(),
      '--grid-rows': gridDimensions.rows.toString()
    }"
  >
    <div
      v-if="hasGoal"
      class="goal-container"
    >
      <GridCell
        v-for="(color, index) in flattenedGrid"
        :key="index"
        :color="color"
      />
    </div>
    
    <div
      v-else
      class="no-goal"
    >
      No goal pattern set
    </div>
  </div>
</template>

<style scoped>
.goal-grid {
  padding: 16px;
  border: 2px solid #4a90e2;
  border-radius: 8px;
  background-color: #f0f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.goal-title {
  font-weight: bold;
  color: #4a90e2;
  margin-bottom: 8px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.goal-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-cols), 1fr);
  grid-template-rows: repeat(var(--grid-rows), 1fr);
  gap: 4px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.2);
  border: 1px solid rgba(74, 144, 226, 0.3);
}

.no-goal {
  padding: 20px;
  color: #666;
  font-style: italic;
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

/* Responsive styling */
@media (max-width: 768px) {
  .goal-grid {
    padding: 8px;
  }
  
  .goal-container {
    gap: 2px;
    padding: 4px;
  }
  
  .goal-title {
    font-size: 12px;
    margin-bottom: 4px;
  }
}
</style>