import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GridCell from '../GridCell.vue'

describe('GridCell', () => {
  it('should render correctly with default color', () => {
    const wrapper = mount(GridCell)
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('grid-cell')
  })

  it('should apply color prop as CSS custom property', () => {
    const wrapper = mount(GridCell, {
      props: { color: 'red' }
    })
    
    expect(wrapper.attributes('style')).toContain('--cell-color: red')
  })

  it('should handle different color values', () => {
    const colors = ['blue', 'green', 'yellow', 'purple', '#ff0000', 'rgb(255, 0, 0)']
    
    colors.forEach(color => {
      const wrapper = mount(GridCell, {
        props: { color }
      })
      
      expect(wrapper.attributes('style')).toContain(`--cell-color: ${color}`)
    })
  })

  it('should have default gray color when no color prop provided', () => {
    const wrapper = mount(GridCell)
    
    expect(wrapper.attributes('style')).toContain('--cell-color: gray')
  })

  it('should be square shaped with proper CSS classes', () => {
    const wrapper = mount(GridCell, {
      props: { color: 'blue' }
    })
    
    expect(wrapper.classes()).toContain('grid-cell')
    
    // Check if it has the proper structure for square shape
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('class')).toContain('grid-cell')
  })

  it('should be accessible with proper ARIA attributes', () => {
    const wrapper = mount(GridCell, {
      props: { color: 'red' }
    })
    
    expect(wrapper.attributes('role')).toBe('gridcell')
    expect(wrapper.attributes('aria-label')).toBe('Grid cell with color red')
  })
})