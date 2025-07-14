import { describe, it, expect } from 'vitest'
import { 
  snapshotToCodeStructure, 
  loadLevelFromSnapshot, 
  EXAMPLE_IF_ELSE_SNAPSHOT 
} from '../codeSnapshotLoader'
import type { CodeEditorSnapshot } from '../../types/codeEditorSnapshot'

describe('Code Snapshot Loader', () => {
  
  describe('snapshotToCodeStructure', () => {
    it('should convert basic snapshot to CodeStructure', () => {
      const basicSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-red' }
              ]
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(basicSnapshot)

      expect(result).toEqual({
        id: expect.any(String),
        type: 'linear',
        lines: [
          {
            id: 'line-1',
            type: 'assignment',
            indentLevel: 0,
            parentLineId: undefined,
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' }
            ],
            placedBlocks: [
              expect.objectContaining({
                id: expect.stringContaining('placed-line-1-0'),
                type: 'variable',
                value: 'p'
              }),
              expect.objectContaining({
                id: expect.stringContaining('placed-line-1-1'),
                type: 'operator',
                value: '='
              }),
              expect.objectContaining({
                id: expect.stringContaining('placed-line-1-2'),
                type: 'color',
                value: 'red'
              })
            ],
            minSlots: 3,
            maxSlots: 10
          }
        ]
      })
    })

    it('should handle null blockIds and blank slots', () => {
      const snapshotWithBlanks: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' },
                { blockId: null },
                { blockId: 'color-red', isBlank: true }
              ]
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(snapshotWithBlanks)

      expect(result.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }),
        null,
        null // Should be null because isBlank: true
      ])
    })

    it('should preserve parent-child relationships', () => {
      const ifElseSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-if',
              type: 'condition',
              indentLevel: 0,
              parentLineId: null,
              slots: [{ blockId: 'ctrl-if' }]
            },
            {
              id: 'line-then',
              type: 'assignment',
              indentLevel: 1,
              parentLineId: 'line-if',
              slots: [{ blockId: 'var-p' }]
            },
            {
              id: 'line-else',
              type: 'condition',
              indentLevel: 0,
              parentLineId: 'line-if',
              slots: [{ blockId: 'ctrl-else' }]
            },
            {
              id: 'line-else-body',
              type: 'assignment',
              indentLevel: 1,
              parentLineId: 'line-else',
              slots: [{ blockId: 'var-p' }]
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(ifElseSnapshot)

      expect(result.lines).toHaveLength(4)
      expect(result.lines[0].parentLineId).toBeUndefined()
      expect(result.lines[1].parentLineId).toBe('line-if')
      expect(result.lines[2].parentLineId).toBe('line-if')
      expect(result.lines[3].parentLineId).toBe('line-else')
    })

    it('should handle invalid block IDs gracefully', () => {
      const snapshotWithInvalidBlocks: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'invalid-block-id' },
                { blockId: 'var-p' }
              ]
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(snapshotWithInvalidBlocks)

      expect(result.lines[0].placedBlocks[0]).toBe(null) // Invalid block should be null
      expect(result.lines[0].placedBlocks[1]).toEqual(
        expect.objectContaining({ type: 'variable', value: 'p' })
      )
    })

    it('should create minimum 3 slots even for shorter slot arrays', () => {
      const shortSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' }
              ]
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(shortSnapshot)

      expect(result.lines[0].slots).toHaveLength(3) // Minimum 3 slots
      expect(result.lines[0].placedBlocks).toHaveLength(3)
      expect(result.lines[0].placedBlocks[0]).toEqual(
        expect.objectContaining({ type: 'variable', value: 'p' })
      )
      expect(result.lines[0].placedBlocks[1]).toBe(null)
      expect(result.lines[0].placedBlocks[2]).toBe(null)
    })
  })

  describe('loadLevelFromSnapshot', () => {
    it('should apply blank slots from parameter', () => {
      const snapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-red' }
              ]
            }
          ]
        }
      }

      const blankSlots = [
        { lineId: 'line-1', slotIndex: 1 },
        { lineId: 'line-1', slotIndex: 2 }
      ]

      const result = loadLevelFromSnapshot(snapshot, blankSlots)

      expect(result.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }),
        null, // Should be blank
        null  // Should be blank
      ])
    })

    it('should apply blank slots from snapshot levelConfig', () => {
      const snapshotWithConfig: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-red' }
              ]
            }
          ]
        },
        levelConfig: {
          blankSlots: [
            { lineId: 'line-1', slotIndex: 0 }
          ]
        }
      }

      const result = loadLevelFromSnapshot(snapshotWithConfig)

      expect(result.lines[0].placedBlocks).toEqual([
        null, // Should be blank from levelConfig
        expect.objectContaining({ type: 'operator', value: '=' }),
        expect.objectContaining({ type: 'color', value: 'red' })
      ])
    })

    it('should prioritize parameter blank slots over snapshot config', () => {
      const snapshotWithConfig: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-red' }
              ]
            }
          ]
        },
        levelConfig: {
          blankSlots: [
            { lineId: 'line-1', slotIndex: 0 }
          ]
        }
      }

      const parameterBlankSlots = [
        { lineId: 'line-1', slotIndex: 2 }
      ]

      const result = loadLevelFromSnapshot(snapshotWithConfig, parameterBlankSlots)

      expect(result.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }), // Not blank (parameter overrides config)
        expect.objectContaining({ type: 'operator', value: '=' }),
        null // Blank from parameter
      ])
    })

    it('should handle blank slots for non-existent lines gracefully', () => {
      const snapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [{ blockId: 'var-p' }]
            }
          ]
        }
      }

      const blankSlots = [
        { lineId: 'non-existent-line', slotIndex: 0 },
        { lineId: 'line-1', slotIndex: 0 }
      ]

      // Should not throw an error
      expect(() => loadLevelFromSnapshot(snapshot, blankSlots)).not.toThrow()
      
      const result = loadLevelFromSnapshot(snapshot, blankSlots)
      expect(result.lines[0].placedBlocks[0]).toBe(null)
    })
  })

  describe('EXAMPLE_IF_ELSE_SNAPSHOT', () => {
    it('should be a valid snapshot that can be loaded', () => {
      expect(() => snapshotToCodeStructure(EXAMPLE_IF_ELSE_SNAPSHOT)).not.toThrow()
      
      const result = snapshotToCodeStructure(EXAMPLE_IF_ELSE_SNAPSHOT)
      
      // Should have 4 lines: if, then, else, else-body
      expect(result.lines).toHaveLength(4)
      
      // Verify structure
      expect(result.lines[0].type).toBe('condition') // if line
      expect(result.lines[1].type).toBe('assignment') // then line
      expect(result.lines[2].type).toBe('condition') // else line
      expect(result.lines[3].type).toBe('assignment') // else body line
      
      // Verify parent relationships
      expect(result.lines[0].parentLineId).toBeUndefined()
      expect(result.lines[1].parentLineId).toBe('line-if')
      expect(result.lines[2].parentLineId).toBe('line-if')
      expect(result.lines[3].parentLineId).toBe('line-else')
    })

    it('should apply blank slots when loaded as level', () => {
      const result = loadLevelFromSnapshot(EXAMPLE_IF_ELSE_SNAPSHOT)
      
      // Check that the specified blank slots are applied
      const levelConfig = EXAMPLE_IF_ELSE_SNAPSHOT.levelConfig!
      const blankSlots = levelConfig.blankSlots!
      
      // Find lines that should have blanks
      const ifLine = result.lines.find(line => line.id === 'line-if')
      const thenLine = result.lines.find(line => line.id === 'line-then')
      const elseBodyLine = result.lines.find(line => line.id === 'line-else-body')
      
      expect(ifLine).toBeDefined()
      expect(thenLine).toBeDefined()
      expect(elseBodyLine).toBeDefined()
      
      // Verify that blank slots are null
      if (ifLine && thenLine && elseBodyLine) {
        // Check if expected slots are blank (based on the levelConfig)
        const ifLineBlankSlots = blankSlots.filter(slot => slot.lineId === 'line-if')
        const thenLineBlankSlots = blankSlots.filter(slot => slot.lineId === 'line-then')
        const elseBodyBlankSlots = blankSlots.filter(slot => slot.lineId === 'line-else-body')
        
        ifLineBlankSlots.forEach(blankSlot => {
          expect(ifLine.placedBlocks[blankSlot.slotIndex]).toBe(null)
        })
        
        thenLineBlankSlots.forEach(blankSlot => {
          expect(thenLine.placedBlocks[blankSlot.slotIndex]).toBe(null)
        })
        
        elseBodyBlankSlots.forEach(blankSlot => {
          expect(elseBodyLine.placedBlocks[blankSlot.slotIndex]).toBe(null)
        })
      }
    })
  })
})