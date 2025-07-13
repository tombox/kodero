export type Color = string
export type Grid = Color[][]

/**
 * Compare two grids for exact equality
 * @param grid1 First grid to compare
 * @param grid2 Second grid to compare
 * @returns true if grids are identical, false otherwise
 */
export function compareGrids(grid1: Grid, grid2: Grid): boolean {
  // Handle empty grids
  if (grid1.length === 0 && grid2.length === 0) {
    return true
  }
  
  if (grid1.length === 0 || grid2.length === 0) {
    return false
  }
  
  // Check if dimensions match
  if (grid1.length !== grid2.length) {
    return false
  }
  
  // Check if all rows have same length
  for (let i = 0; i < grid1.length; i++) {
    if (grid1[i].length !== grid2[i].length) {
      return false
    }
  }
  
  // Compare each cell
  for (let row = 0; row < grid1.length; row++) {
    for (let col = 0; col < grid1[row].length; col++) {
      if (grid1[row][col] !== grid2[row][col]) {
        return false
      }
    }
  }
  
  return true
}

/**
 * Check if the canvas grid matches the goal grid (level completion)
 * @param canvasGrid Current canvas state
 * @param goalGrid Target goal pattern
 * @returns true if canvas matches goal exactly
 */
export function isGridComplete(canvasGrid: Grid, goalGrid: Grid): boolean {
  return compareGrids(canvasGrid, goalGrid)
}

/**
 * Calculate what percentage of cells match between two grids
 * @param canvasGrid Current canvas state
 * @param goalGrid Target goal pattern
 * @returns percentage (0-100) of matching cells
 */
export function getMatchPercentage(canvasGrid: Grid, goalGrid: Grid): number {
  // Handle empty grids
  if (goalGrid.length === 0) {
    return canvasGrid.length === 0 ? 100 : 0
  }
  
  if (canvasGrid.length === 0) {
    return 0
  }
  
  // Check if dimensions match
  if (canvasGrid.length !== goalGrid.length) {
    return 0
  }
  
  let totalCells = 0
  let matchingCells = 0
  
  for (let row = 0; row < goalGrid.length; row++) {
    // Skip rows with mismatched lengths
    if (canvasGrid[row].length !== goalGrid[row].length) {
      continue
    }
    
    for (let col = 0; col < goalGrid[row].length; col++) {
      totalCells++
      if (canvasGrid[row][col] === goalGrid[row][col]) {
        matchingCells++
      }
    }
  }
  
  if (totalCells === 0) {
    return 0
  }
  
  return Math.round((matchingCells / totalCells) * 100)
}

/**
 * Get detailed comparison result with cell-by-cell analysis
 * @param canvasGrid Current canvas state
 * @param goalGrid Target goal pattern
 * @returns object with completion status and detailed results
 */
export function getGridComparisonResult(canvasGrid: Grid, goalGrid: Grid) {
  const isComplete = isGridComplete(canvasGrid, goalGrid)
  const matchPercentage = getMatchPercentage(canvasGrid, goalGrid)
  
  // Create a difference map showing which cells match
  const differenceMap: boolean[][] = []
  
  if (canvasGrid.length === goalGrid.length && goalGrid.length > 0) {
    for (let row = 0; row < goalGrid.length; row++) {
      differenceMap[row] = []
      if (canvasGrid[row] && goalGrid[row] && canvasGrid[row].length === goalGrid[row].length) {
        for (let col = 0; col < goalGrid[row].length; col++) {
          differenceMap[row][col] = canvasGrid[row][col] === goalGrid[row][col]
        }
      }
    }
  }
  
  return {
    isComplete,
    matchPercentage,
    differenceMap,
    totalCells: goalGrid.flat().length,
    matchingCells: Math.round((matchPercentage / 100) * goalGrid.flat().length)
  }
}