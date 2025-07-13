import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CanvasGrid from '../CanvasGrid.vue'
import GridCell from '../GridCell.vue'

describe('CanvasGrid', () => {
  const mockGrid5x5 = [
    ['red', 'blue', 'green', 'yellow', 'purple'],
    ['blue', 'red', 'yellow', 'green', 'purple'],
    ['green', 'yellow', 'red', 'purple', 'blue'],
    ['yellow', 'green', 'purple', 'red', 'blue'],
    ['purple', 'blue', 'red', 'green', 'yellow']
  ]

  const mockGrid3x3 = [
    ['red', 'blue', 'green'],
    ['blue', 'red', 'yellow'],
    ['green', 'yellow', 'red']
  ]

  it('should render correctly with default empty grid', () => {
    const wrapper = mount(CanvasGrid)
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('canvas-grid')
  })

  it('should render 5x5 grid by default with gray cells', () => {
    const wrapper = mount(CanvasGrid)
    
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(25) // 5x5 = 25 cells
    
    // Check that default cells are gray
    gridCells.forEach(cell => {
      expect(cell.props('color')).toBe('gray')
    })
  })

  it('should render custom grid data correctly', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: mockGrid5x5 }
    })
    
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(25)
    
    // Check first row colors
    expect(gridCells[0].props('color')).toBe('red')
    expect(gridCells[1].props('color')).toBe('blue')
    expect(gridCells[2].props('color')).toBe('green')
    expect(gridCells[3].props('color')).toBe('yellow')
    expect(gridCells[4].props('color')).toBe('purple')
  })

  it('should handle different grid sizes', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: mockGrid3x3 }
    })
    
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(9) // 3x3 = 9 cells
    
    // Check that colors are applied correctly
    expect(gridCells[0].props('color')).toBe('red')
    expect(gridCells[1].props('color')).toBe('blue')
    expect(gridCells[2].props('color')).toBe('green')
  })

  it('should have proper CSS grid layout', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: mockGrid5x5 }
    })
    
    expect(wrapper.classes()).toContain('canvas-grid')
    
    // Check grid container structure
    const gridContainer = wrapper.find('.grid-container')
    expect(gridContainer.exists()).toBe(true)
  })

  it('should apply correct grid dimensions as CSS custom properties', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: mockGrid3x3 }
    })
    
    expect(wrapper.attributes('style')).toContain('--grid-cols: 3')
    expect(wrapper.attributes('style')).toContain('--grid-rows: 3')
  })

  it('should be accessible with proper ARIA attributes', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: mockGrid5x5 }
    })
    
    expect(wrapper.attributes('role')).toBe('grid')
    expect(wrapper.attributes('aria-label')).toBe('Canvas grid 5x5')
  })

  it('should handle empty or invalid grid gracefully', () => {
    const wrapper = mount(CanvasGrid, {
      props: { grid: [] }
    })
    
    // Should fall back to default 5x5 grid
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(25)
  })
})