import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../Home.vue'

describe('Home - Game Interface', () => {
  it('should render correctly', () => {
    const wrapper = mount(Home)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display main menu when currentLevel is 0', () => {
    const wrapper = mount(Home)
    expect(wrapper.text()).toContain('⚄ Kodero')
    expect(wrapper.text()).toContain('Visual Programming Adventure')
    expect(wrapper.text()).toContain('🚀 Start Level 1')
    expect(wrapper.text()).toContain('🔬 Sandbox Mode')
    expect(wrapper.text()).toContain('Start with guided levels or explore freely in sandbox mode!')
  })

  it('should have start level button', () => {
    const wrapper = mount(Home)
    const startButton = wrapper.find('.start-btn')
    
    expect(startButton.exists()).toBe(true)
    expect(startButton.text()).toContain('🚀 Start Level 1')
  })

  it('should have sandbox mode button', () => {
    const wrapper = mount(Home)
    const sandboxButton = wrapper.find('.sandbox-btn')
    
    expect(sandboxButton.exists()).toBe(true)
    expect(sandboxButton.text()).toContain('🔬 Sandbox Mode')
  })

  it('should show GameBoard when level is selected', async () => {
    const wrapper = mount(Home)
    
    // Start level 1
    const startButton = wrapper.find('.start-btn')
    await startButton.trigger('click')
    
    // Should now show GameBoard instead of main menu
    expect(wrapper.find('.main-menu').exists()).toBe(false)
    expect(wrapper.find('.kodero-game').exists()).toBe(true)
  })

  it('should show sandbox mode when sandbox button is clicked', async () => {
    const wrapper = mount(Home)
    
    // Click sandbox button
    const sandboxButton = wrapper.find('.sandbox-btn')
    await sandboxButton.trigger('click')
    
    // Should show sandbox interface
    expect(wrapper.find('.sandbox-container').exists()).toBe(true)
    expect(wrapper.text()).toContain('🔬 Sandbox Mode')
    expect(wrapper.text()).toContain('← Exit Sandbox')
  })

  it('should return to main menu from sandbox', async () => {
    const wrapper = mount(Home)
    
    // Enter sandbox mode
    const sandboxButton = wrapper.find('.sandbox-btn')
    await sandboxButton.trigger('click')
    
    // Exit sandbox mode
    const exitButton = wrapper.find('.exit-sandbox-btn')
    await exitButton.trigger('click')
    
    // Should return to main menu
    expect(wrapper.find('.main-menu').exists()).toBe(true)
    expect(wrapper.find('.sandbox-container').exists()).toBe(false)
  })

  it('should have proper game title styling', () => {
    const wrapper = mount(Home)
    const title = wrapper.find('.game-title')
    
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('⚄ Kodero')
  })

  it('should have proper game subtitle', () => {
    const wrapper = mount(Home)
    const subtitle = wrapper.find('.game-subtitle')
    
    expect(subtitle.exists()).toBe(true)
    expect(subtitle.text()).toBe('Visual Programming Adventure')
  })

  it('should handle level progression correctly', async () => {
    const wrapper = mount(Home)
    
    // Start level 1
    const startButton = wrapper.find('.start-btn')
    await startButton.trigger('click')
    
    // Should show Level 1 content
    expect(wrapper.text()).toContain('Level 1')
    expect(wrapper.text()).toContain('All Red')
  })
})