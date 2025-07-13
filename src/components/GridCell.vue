<script setup lang="ts">
interface Props {
  color?: string
}

const { color = '' } = defineProps<Props>()

// Use gray as fallback for empty cells
const displayColor = (color && color.trim() !== '') ? color : '#f0f0f0'
console.log('GridCell: color prop =', JSON.stringify(color), 'displayColor =', displayColor)
console.log('GridCell: color truthy?', !!color, 'color length:', color?.length)
console.log('GridCell: empty class will be applied:', !color || color.trim() === '')
</script>

<template>
  <div
    class="grid-cell"
    role="gridcell"
    :aria-label="`Grid cell with color ${color || 'empty'}`"
    :style="{ backgroundColor: displayColor }"
    :class="{ empty: !color || color.trim() === '' }"
  />
</template>

<style scoped>
.grid-cell {
  border: 2px solid #333;
  border-radius: 4px;
  aspect-ratio: 1;
  min-width: 40px;
  min-height: 40px;
  transition: all 0.2s ease;
}

.grid-cell:hover {
  border-color: #666;
  transform: scale(1.02);
}

.grid-cell.empty {
  background-color: #f0f0f0;
  border-color: #ddd;
  opacity: 0.7;
}

</style>