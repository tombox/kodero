import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import CanvasGrid from '../CanvasGrid.vue'
import GoalGrid from '../GoalGrid.vue'
import { compareGrids, getMatchPercentage, getGridComparisonResult } from '../../utils/gridComparison'

// Integration test component that uses both grids
const GridSystemTest = defineComponent({
  components: {
    CanvasGrid,
    GoalGrid
  },
  props: {
    canvasGrid: {
      type: Array,
      default: () => []
    },
    goalGrid: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const isComplete = () => compareGrids(props.canvasGrid, props.goalGrid)
    const matchPercentage = () => getMatchPercentage(props.canvasGrid, props.goalGrid)
    
    return {
      isComplete,
      matchPercentage
    }
  },
  template: `
    <div class="grid-system">
      <div class="canvas-section">
        <h3>Canvas</h3>
        <CanvasGrid :grid="canvasGrid" />
      </div>
      
      <div class="goal-section">
        <h3>Goal</h3>
        <GoalGrid :goal-grid="goalGrid" />
      </div>
      
      <div class="status">
        <div class="completion-status" :class="{ complete: isComplete() }">
          {{ isComplete() ? 'Complete!' : 'Incomplete' }}
        </div>
        <div class="match-percentage">
          {{ matchPercentage() }}% Match
        </div>
      </div>
    </div>
  `
})

describe('Grid System Integration', () => {
  const simpleGoal = [
    ['red', 'blue'],
    ['green', 'yellow']
  ]

  const matchingCanvas = [
    ['red', 'blue'],
    ['green', 'yellow']
  ]

  const partialCanvas = [
    ['red', 'blue'],
    ['green', 'red']
  ]

  const emptyCanvas = [
    ['gray', 'gray'],
    ['gray', 'gray']
  ]

  it('should render both canvas and goal grids correctly', () => {
    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: matchingCanvas,
        goalGrid: simpleGoal
      }
    })

    expect(wrapper.findComponent(CanvasGrid).exists()).toBe(true)
    expect(wrapper.findComponent(GoalGrid).exists()).toBe(true)
    
    // Check that both grids have the correct number of cells
    const canvasComponent = wrapper.findComponent(CanvasGrid)
    const goalComponent = wrapper.findComponent(GoalGrid)
    
    expect(canvasComponent.props('grid')).toEqual(matchingCanvas)
    expect(goalComponent.props('goalGrid')).toEqual(simpleGoal)
  })

  it('should show completion status when grids match', () => {
    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: matchingCanvas,
        goalGrid: simpleGoal
      }
    })

    const completionStatus = wrapper.find('.completion-status')
    expect(completionStatus.text()).toBe('Complete!')
    expect(completionStatus.classes()).toContain('complete')
    
    const matchPercentage = wrapper.find('.match-percentage')
    expect(matchPercentage.text()).toBe('100% Match')
  })

  it('should show incomplete status when grids do not match', () => {
    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: partialCanvas,
        goalGrid: simpleGoal
      }
    })

    const completionStatus = wrapper.find('.completion-status')
    expect(completionStatus.text()).toBe('Incomplete')
    expect(completionStatus.classes()).not.toContain('complete')
    
    const matchPercentage = wrapper.find('.match-percentage')
    expect(matchPercentage.text()).toBe('75% Match')
  })

  it('should handle empty canvas correctly', () => {
    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: emptyCanvas,
        goalGrid: simpleGoal
      }
    })

    const completionStatus = wrapper.find('.completion-status')
    expect(completionStatus.text()).toBe('Incomplete')
    
    const matchPercentage = wrapper.find('.match-percentage')
    expect(matchPercentage.text()).toBe('0% Match')
  })

  it('should handle larger grids (5x5)', () => {
    const largeGoal = [
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red']
    ]

    const largeCanvas = [
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red']
    ]

    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: largeCanvas,
        goalGrid: largeGoal
      }
    })

    // Should have 25 cells each
    const canvasComponent = wrapper.findComponent(CanvasGrid)
    const canvasCells = canvasComponent.findAll('.grid-cell')
    expect(canvasCells).toHaveLength(25)

    const goalComponent = wrapper.findComponent(GoalGrid)
    const goalCells = goalComponent.findAll('.grid-cell')
    expect(goalCells).toHaveLength(25)

    // Should be complete
    const completionStatus = wrapper.find('.completion-status')
    expect(completionStatus.text()).toBe('Complete!')
  })

  it('should handle real-time grid updates', async () => {
    const wrapper = mount(GridSystemTest, {
      props: {
        canvasGrid: partialCanvas,
        goalGrid: simpleGoal
      }
    })

    // Initially incomplete
    expect(wrapper.find('.completion-status').text()).toBe('Incomplete')
    expect(wrapper.find('.match-percentage').text()).toBe('75% Match')

    // Update to matching grid
    await wrapper.setProps({
      canvasGrid: matchingCanvas
    })

    // Should now be complete
    expect(wrapper.find('.completion-status').text()).toBe('Complete!')
    expect(wrapper.find('.match-percentage').text()).toBe('100% Match')
  })
})

describe('Grid Comparison Integration', () => {
  const goalPattern = [
    ['blue', 'blue', 'blue', 'blue', 'blue'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red'],
    ['red', 'red', 'red', 'red', 'red']
  ]

  it('should provide detailed comparison results', () => {
    const canvasWithErrors = [
      ['blue', 'red', 'blue', 'blue', 'blue'], // 1 error
      ['red', 'red', 'red', 'red', 'red'],       // 0 errors
      ['red', 'red', 'blue', 'red', 'red'],      // 1 error
      ['red', 'red', 'red', 'red', 'red'],       // 0 errors
      ['red', 'red', 'red', 'red', 'red']        // 0 errors
    ]

    const result = getGridComparisonResult(canvasWithErrors, goalPattern)
    
    expect(result.isComplete).toBe(false)
    expect(result.totalCells).toBe(25)
    expect(result.matchingCells).toBe(23) // 25 - 2 errors
    expect(result.matchPercentage).toBe(92) // 23/25 = 92%
    
    // Check difference map
    expect(result.differenceMap[0][1]).toBe(false) // Error at [0][1]
    expect(result.differenceMap[2][2]).toBe(false) // Error at [2][2]
    expect(result.differenceMap[1][0]).toBe(true)  // Correct at [1][0]
  })

  it('should handle perfect match scenarios', () => {
    const result = getGridComparisonResult(goalPattern, goalPattern)
    
    expect(result.isComplete).toBe(true)
    expect(result.matchPercentage).toBe(100)
    expect(result.totalCells).toBe(25)
    expect(result.matchingCells).toBe(25)
    
    // All cells should match
    result.differenceMap.forEach(row => {
      row.forEach(cellMatches => {
        expect(cellMatches).toBe(true)
      })
    })
  })
})