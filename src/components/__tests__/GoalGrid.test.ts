import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GoalGrid from '../GoalGrid.vue'
import GridCell from '../GridCell.vue'

describe('GoalGrid', () => {
  const mockGoalGrid = [
    ['blue', 'blue', 'blue', 'blue', 'blue'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red']
  ]

  const mockSmallGrid = [
    ['red', 'blue'],
    ['blue', 'red']
  ]

  it('should render correctly with goal grid data', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockGoalGrid }
    })
    
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.classes()).toContain('goal-grid')
  })

  it('should render all grid cells with correct colors', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockGoalGrid }
    })
    
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(25) // 5x5 = 25 cells
    
    // Check first row (should be all blue)
    for (let i = 0; i < 5; i++) {
      expect(gridCells[i].props('color')).toBe('blue')
    }
    
    // Check second row (should be all red)
    for (let i = 5; i < 10; i++) {
      expect(gridCells[i].props('color')).toBe('red')
    }
  })

  it('should handle different grid sizes', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockSmallGrid }
    })
    
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(4) // 2x2 = 4 cells
    
    expect(gridCells[0].props('color')).toBe('red')
    expect(gridCells[1].props('color')).toBe('blue')
    expect(gridCells[2].props('color')).toBe('blue')
    expect(gridCells[3].props('color')).toBe('red')
  })

  it('should have goal-specific styling', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockGoalGrid }
    })
    
    expect(wrapper.classes()).toContain('goal-grid')
    
    // Should have distinct styling from canvas grid
    const goalContainer = wrapper.find('.goal-container')
    expect(goalContainer.exists()).toBe(true)
  })

  it('should apply correct grid dimensions', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockSmallGrid }
    })
    
    expect(wrapper.attributes('style')).toContain('--grid-cols: 2')
    expect(wrapper.attributes('style')).toContain('--grid-rows: 2')
  })

  it('should be accessible with proper ARIA attributes', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockGoalGrid }
    })
    
    expect(wrapper.attributes('role')).toBe('grid')
    expect(wrapper.attributes('aria-label')).toBe('Goal pattern 5x5')
  })

  it('should handle empty goal grid gracefully', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: [] }
    })
    
    // Should not render any cells when no goal is provided
    const gridCells = wrapper.findAllComponents(GridCell)
    expect(gridCells).toHaveLength(0)
    
    // Should show placeholder message
    expect(wrapper.text()).toContain('No goal pattern set')
  })

  it('should have visual indicator that this is a goal/target', () => {
    const wrapper = mount(GoalGrid, {
      props: { goalGrid: mockGoalGrid }
    })
    
    // Should have title or label indicating it's the goal
    const title = wrapper.find('.goal-title')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Goal')
  })
})