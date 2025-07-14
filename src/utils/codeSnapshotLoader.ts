/**
 * Utility to convert CodeEditorSnapshot JSON format to CodeStructure
 * for level loading and backwards compatibility
 */

import type { CodeStructure, CodeLine } from '../types/codeStructures'
import type { CodeEditorSnapshot, CodeLineSnapshot } from '../types/codeEditorSnapshot'
import type { CodeBlock } from '../types/codeBlocks'
import { AVAILABLE_BLOCKS } from '../types/codeBlocks'

/**
 * Convert a CodeEditorSnapshot to CodeStructure format
 * @param snapshot JSON snapshot from export
 * @returns CodeStructure that can be loaded into the editor
 */
export function snapshotToCodeStructure(snapshot: CodeEditorSnapshot): CodeStructure {
  const structure: CodeStructure = {
    id: `structure-${Date.now()}`,
    type: 'linear',
    lines: snapshot.structure.lines.map((lineSnapshot, lineIndex): CodeLine => {
      // Create slots based on the number of blocks (not including blanks)
      const totalSlots = Math.max(lineSnapshot.slots.length, 3) // Minimum 3 slots
      const slots = Array.from({ length: totalSlots }, (_, index) => ({
        id: `slot-${index}`,
        placeholder: 'drop here'
      }))
      
      // Create placed blocks, respecting blank slots
      const placedBlocks = Array.from({ length: totalSlots }, (_, index): CodeBlock | null => {
        const slotData = lineSnapshot.slots[index]
        
        // If slot doesn't exist or is marked as blank, leave empty
        if (!slotData || !slotData.blockId || slotData.isBlank) {
          return null
        }
        
        // Find the original block from AVAILABLE_BLOCKS
        const originalBlock = AVAILABLE_BLOCKS.find(b => b.id === slotData.blockId)
        
        if (!originalBlock) {
          console.warn(`Block not found in AVAILABLE_BLOCKS: ${slotData.blockId}`)
          return null
        }
        
        // Create a unique instance for the editor
        return {
          ...originalBlock,
          id: `placed-${lineSnapshot.id}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
        }
      })
      
      return {
        id: lineSnapshot.id,
        type: lineSnapshot.type,
        indentLevel: lineSnapshot.indentLevel,
        parentLineId: lineSnapshot.parentLineId || undefined,
        slots,
        placedBlocks,
        minSlots: 3,
        maxSlots: 10
      }
    })
  }
  
  return structure
}

/**
 * Load a level from JSON snapshot with specific blocks marked as blank
 * @param snapshot The complete code structure
 * @param blankSlots Optional array of slots to make blank (overrides snapshot config)
 * @returns CodeStructure ready for level play
 */
export function loadLevelFromSnapshot(
  snapshot: CodeEditorSnapshot, 
  blankSlots?: Array<{ lineId: string; slotIndex: number }>
): CodeStructure {
  // Create a copy of the snapshot with blanks applied
  const snapshotCopy: CodeEditorSnapshot = JSON.parse(JSON.stringify(snapshot))
  
  // Apply blank slots (either from parameter or snapshot config)
  const slotsToBlank = blankSlots || snapshot.levelConfig?.blankSlots || []
  
  slotsToBlank.forEach(({ lineId, slotIndex }) => {
    const line = snapshotCopy.structure.lines.find(l => l.id === lineId)
    if (line && line.slots[slotIndex]) {
      line.slots[slotIndex].isBlank = true
    }
  })
  
  return snapshotToCodeStructure(snapshotCopy)
}

/**
 * Example working if-else structure for level creation
 */
export const LEVEL_2_SNAPSHOT: CodeEditorSnapshot = {
  "version": "1.0",
  "metadata": {
    "name": "level2",
    "description": "Sandbox Mode: Experiment freely with all available blocks",
    "created": "2025-07-14T08:25:25.743Z"
  },
  "structure": {
    "lines": [
      {
        "id": "line-1",
        "type": "assignment",
        "indentLevel": 0,
        "parentLineId": null,
        "slots": [
          {
            "blockId": "ctrl-if",
            "isBlank": false
          },
          {
            "blockId": "var-x",
            "isBlank": false
          },
          {
            "blockId": "op-less",
            "isBlank": false
          },
          {
            "blockId": "num-2",
            "isBlank": true
          },
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481490514-4kdbks92r",
        "type": "expression",
        "indentLevel": 1,
        "parentLineId": "line-1",
        "slots": [
          {
            "blockId": "var-p",
            "isBlank": false
          },
          {
            "blockId": "op-assign",
            "isBlank": false
          },
          {
            "blockId": "color-red",
            "isBlank": false
          },
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481499296-0ejsolt8e",
        "type": "expression",
        "indentLevel": 1,
        "parentLineId": "line-1",
        "slots": [
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481490514-g44uscvn2",
        "type": "expression",
        "indentLevel": 0,
        "parentLineId": null,
        "slots": [
          {
            "blockId": "ctrl-else",
            "isBlank": false
          },
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481505332-cc3k7mzqo",
        "type": "expression",
        "indentLevel": 1,
        "parentLineId": "line-1752481490514-g44uscvn2",
        "slots": [
          {
            "blockId": "var-p",
            "isBlank": false
          },
          {
            "blockId": "op-assign",
            "isBlank": false
          },
          {
            "blockId": "color-blue",
            "isBlank": false
          },
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481508019-7rq2wr90s",
        "type": "expression",
        "indentLevel": 1,
        "parentLineId": "line-1752481490514-g44uscvn2",
        "slots": [
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      },
      {
        "id": "line-1752481505331-ajgqh14gi",
        "type": "expression",
        "indentLevel": 0,
        "parentLineId": null,
        "slots": [
          {
            "blockId": null,
            "isBlank": false
          }
        ]
      }
    ]
  }
}

export const EXAMPLE_IF_ELSE_SNAPSHOT: CodeEditorSnapshot = {
  version: "1.0",
  metadata: {
    name: "If-Else Example",
    description: "Complete if-else structure for red center column",
    created: "2025-07-14T08:00:00.000Z"
  },
  structure: {
    lines: [
      {
        id: "line-if",
        type: "condition",
        indentLevel: 0,
        parentLineId: null,
        slots: [
          { blockId: "ctrl-if" },
          { blockId: "var-x" },
          { blockId: "op-equals" },
          { blockId: "num-2" }
        ]
      },
      {
        id: "line-then",
        type: "assignment",
        indentLevel: 1,
        parentLineId: "line-if",
        slots: [
          { blockId: "var-p" },
          { blockId: "op-assign" },
          { blockId: "color-red" }
        ]
      },
      {
        id: "line-else",
        type: "condition",
        indentLevel: 0,
        parentLineId: "line-if",
        slots: [
          { blockId: "ctrl-else" }
        ]
      },
      {
        id: "line-else-body",
        type: "assignment",
        indentLevel: 1,
        parentLineId: "line-else",
        slots: [
          { blockId: "var-p" },
          { blockId: "op-assign" },
          { blockId: "color-blue" }
        ]
      }
    ]
  },
  levelConfig: {
    blankSlots: [
      { lineId: "line-if", slotIndex: 2 },  // op-equals
      { lineId: "line-if", slotIndex: 3 },  // num-2
      { lineId: "line-then", slotIndex: 0 }, // var-p
      { lineId: "line-then", slotIndex: 1 }, // op-assign
      { lineId: "line-then", slotIndex: 2 }, // color-red
      { lineId: "line-else-body", slotIndex: 2 } // color-blue
    ]
  }
}