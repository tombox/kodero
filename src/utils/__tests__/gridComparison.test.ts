import { describe, it, expect } from 'vitest'
import { compareGrids, isGridComplete, getMatchPercentage } from '../gridComparison'

describe('Grid Comparison Utilities', () => {
  describe('compareGrids', () => {
    it('should return true for identical grids', () => {
      const grid1 = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      const grid2 = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      
      expect(compareGrids(grid1, grid2)).toBe(true)
    })

    it('should return false for different grids', () => {
      const grid1 = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      const grid2 = [
        ['red', 'blue'],
        ['green', 'red']
      ]
      
      expect(compareGrids(grid1, grid2)).toBe(false)
    })

    it('should return false for grids with different dimensions', () => {
      const grid1 = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      const grid2 = [
        ['red', 'blue', 'green'],
        ['green', 'yellow', 'red']
      ]
      
      expect(compareGrids(grid1, grid2)).toBe(false)
    })

    it('should return false for grids with different row counts', () => {
      const grid1 = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      const grid2 = [
        ['red', 'blue'],
        ['green', 'yellow'],
        ['purple', 'orange']
      ]
      
      expect(compareGrids(grid1, grid2)).toBe(false)
    })

    it('should handle empty grids', () => {
      expect(compareGrids([], [])).toBe(true)
      expect(compareGrids([], [['red']])).toBe(false)
      expect(compareGrids([['red']], [])).toBe(false)
    })

    it('should handle single cell grids', () => {
      expect(compareGrids([['red']], [['red']])).toBe(true)
      expect(compareGrids([['red']], [['blue']])).toBe(false)
    })

    it('should handle large grids efficiently', () => {
      const largeGrid1 = Array(10).fill(null).map(() => Array(10).fill('red'))
      const largeGrid2 = Array(10).fill(null).map(() => Array(10).fill('red'))
      const largeGrid3 = Array(10).fill(null).map(() => Array(10).fill('blue'))
      
      expect(compareGrids(largeGrid1, largeGrid2)).toBe(true)
      expect(compareGrids(largeGrid1, largeGrid3)).toBe(false)
    })

    it('should be case sensitive for color comparison', () => {
      const grid1 = [['Red']]
      const grid2 = [['red']]
      
      expect(compareGrids(grid1, grid2)).toBe(false)
    })
  })

  describe('isGridComplete', () => {
    const goalGrid = [
      ['blue', 'blue', 'blue', 'blue', 'blue'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'red']
    ]

    it('should return true when canvas matches goal exactly', () => {
      const canvasGrid = [
        ['blue', 'blue', 'blue', 'blue', 'blue'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red']
      ]
      
      expect(isGridComplete(canvasGrid, goalGrid)).toBe(true)
    })

    it('should return false when canvas does not match goal', () => {
      const canvasGrid = [
        ['red', 'blue', 'blue', 'blue', 'blue'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red'],
        ['red', 'red', 'red', 'red', 'red']
      ]
      
      expect(isGridComplete(canvasGrid, goalGrid)).toBe(false)
    })

    it('should return false when canvas is all default color', () => {
      const canvasGrid = Array(5).fill(null).map(() => Array(5).fill('gray'))
      
      expect(isGridComplete(canvasGrid, goalGrid)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isGridComplete([], [])).toBe(true)
      expect(isGridComplete([], goalGrid)).toBe(false)
      expect(isGridComplete(goalGrid, [])).toBe(false)
    })

    it('should return completion percentage for partial matches', () => {
      const partiallyMatchingGrid = [
        ['blue', 'blue', 'blue', 'blue', 'blue'], // Perfect match
        ['red', 'red', 'red', 'red', 'red'],       // Perfect match
        ['red', 'blue', 'red', 'red', 'red'],      // 1 wrong
        ['red', 'red', 'red', 'red', 'red'],       // Perfect match
        ['red', 'red', 'red', 'red', 'red']        // Perfect match
      ]
      
      // Test function that returns percentage
      expect(isGridComplete(partiallyMatchingGrid, goalGrid)).toBe(false)
    })
  })

  describe('getMatchPercentage', () => {
    it('should calculate correct match percentage', () => {
      // This will be useful for showing progress
      const goalGrid = [
        ['red', 'blue'],
        ['green', 'yellow']
      ]
      
      const halfMatchGrid = [
        ['red', 'blue'],    // 2 matches
        ['green', 'red']    // 1 match, 1 miss
      ]
      
      expect(getMatchPercentage(halfMatchGrid, goalGrid)).toBe(75) // 3/4 = 75%
    })
  })
})