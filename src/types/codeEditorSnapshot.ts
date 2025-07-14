/**
 * JSON format for exporting/importing code editor layouts
 * This allows for exact reproduction of working code structures
 */

export interface CodeEditorSnapshot {
  version: string
  metadata?: {
    name?: string
    description?: string
    author?: string
    created?: string
  }
  structure: {
    lines: CodeLineSnapshot[]
  }
  levelConfig?: {
    // Specify which slots should be blank when loading as a level
    blankSlots: Array<{
      lineId: string
      slotIndex: number
    }>
    // Optionally specify available blocks for the level
    availableBlocks?: string[]
  }
}

export interface CodeLineSnapshot {
  id: string
  type: 'expression' | 'condition' | 'assignment'
  indentLevel: number
  parentLineId: string | null
  slots: Array<{
    blockId: string | null  // Block ID from AVAILABLE_BLOCKS, null for empty
    isBlank?: boolean      // Mark as blank for level puzzles (will be removed when loading)
  }>
}

/**
 * Utility type for level definitions using the new JSON format
 */
export interface LevelDefinition {
  level: number
  title: string
  description: string
  hint: string
  goalGrid: string[][]
  availableBlocks: string[]
  initialCode: CodeEditorSnapshot
}

/**
 * Example JSON structure for if-else pattern:
 * {
 *   "version": "1.0",
 *   "structure": {
 *     "lines": [
 *       {
 *         "id": "line-1",
 *         "type": "condition",
 *         "indentLevel": 0,
 *         "parentLineId": null,
 *         "slots": [
 *           { "blockId": "ctrl-if" },
 *           { "blockId": "var-x" },
 *           { "blockId": "op-equals", "isBlank": true },
 *           { "blockId": "num-2", "isBlank": true }
 *         ]
 *       },
 *       {
 *         "id": "line-2",
 *         "type": "assignment", 
 *         "indentLevel": 1,
 *         "parentLineId": "line-1",
 *         "slots": [
 *           { "blockId": "var-p", "isBlank": true },
 *           { "blockId": "op-assign", "isBlank": true },
 *           { "blockId": "color-red", "isBlank": true }
 *         ]
 *       },
 *       {
 *         "id": "line-3",
 *         "type": "condition",
 *         "indentLevel": 0,
 *         "parentLineId": "line-1",
 *         "slots": [
 *           { "blockId": "ctrl-else" }
 *         ]
 *       },
 *       {
 *         "id": "line-4",
 *         "type": "assignment",
 *         "indentLevel": 1, 
 *         "parentLineId": "line-3",
 *         "slots": [
 *           { "blockId": "var-p" },
 *           { "blockId": "op-assign" },
 *           { "blockId": "color-blue", "isBlank": true }
 *         ]
 *       }
 *     ]
 *   },
 *   "levelConfig": {
 *     "blankSlots": [
 *       { "lineId": "line-1", "slotIndex": 2 },
 *       { "lineId": "line-1", "slotIndex": 3 },
 *       { "lineId": "line-2", "slotIndex": 0 },
 *       { "lineId": "line-2", "slotIndex": 1 },
 *       { "lineId": "line-2", "slotIndex": 2 },
 *       { "lineId": "line-4", "slotIndex": 2 }
 *     ]
 *   }
 * }
 */