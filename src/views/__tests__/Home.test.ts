import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../Home.vue'

describe('Home - Development Playground', () => {
  it('should render correctly', () => {
    const wrapper = mount(Home)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display playground title and sections', () => {
    const wrapper = mount(Home)
    expect(wrapper.text()).toContain('Kodero Development Playground')
    expect(wrapper.text()).toContain('Phase 1: Grid System (Completed)')
    expect(wrapper.text()).toContain('Phase 2: Code Block System (Completed)')
    expect(wrapper.text()).toContain('Phase 3: Drag & Drop System (Completed)')
    expect(wrapper.text()).toContain('Phase 4: Code Editor System (Completed)')
  })

  it('should have interactive grid completion toggle', () => {
    const wrapper = mount(Home)
    const button = wrapper.find('.demo-button')

    // Should have a toggle button that changes based on completion state
    expect(button.exists()).toBe(true)
    expect(button.text()).toMatch(/Make (Complete|Incomplete)/)
  })

  it('should display grid comparison status', () => {
    const wrapper = mount(Home)
    
    // Should show match percentage and status
    expect(wrapper.text()).toContain('Match:')
    expect(wrapper.text()).toContain('%')
    expect(wrapper.text()).toContain('Cells:')
    expect(wrapper.text()).toContain('Status:')
  })

  it('should display code block demonstrations', () => {
    const wrapper = mount(Home)
    
    // Should show different block types
    expect(wrapper.text()).toContain('Variables')
    expect(wrapper.text()).toContain('Numbers')
    expect(wrapper.text()).toContain('Operators')
    expect(wrapper.text()).toContain('Colors')
    expect(wrapper.text()).toContain('Control')
  })

  it('should have both grouped and flat toolbox demos', () => {
    const wrapper = mount(Home)
    
    expect(wrapper.text()).toContain('Toolbox (Grouped)')
    expect(wrapper.text()).toContain('Toolbox (Flat)')
  })
})
