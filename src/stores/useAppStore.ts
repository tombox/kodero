import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const appName = ref('Kodero')
  const version = ref('1.0.0')
  const isDarkMode = ref(false)

  // Getters
  const appInfo = computed(() => `${appName.value} v${version.value}`)
  const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

  // Actions
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
  }

  function updateAppName(newName: string) {
    appName.value = newName
  }

  return {
    appName,
    version,
    isDarkMode,
    appInfo,
    theme,
    toggleDarkMode,
    updateAppName
  }
})