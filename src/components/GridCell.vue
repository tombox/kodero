<script setup lang="ts">
interface Props {
  color?: string
}

const { color = 'gray' } = defineProps<Props>()
</script>

<template>
  <div
    class="grid-cell"
    role="gridcell"
    :aria-label="`Grid cell with color ${color}`"
    :style="{ '--cell-color': color }"
  />
</template>

<style scoped>
.grid-cell {
  background-color: var(--cell-color);
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
</style>