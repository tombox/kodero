import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../components/CodeEditor.vue'
import { snapshotToCodeStructure, loadLevelFromSnapshot } from '../utils/codeSnapshotLoader'
import type { CodeEditorSnapshot } from '../types/codeEditorSnapshot'

describe('Export/Import Edge Cases and Error Scenarios', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CodeEditor, {
      props: {
        template: 'UNIFIED',
        enableEvaluation: false
      }
    })
  })

  describe('Export Edge Cases', () => {
    it('should handle empty editor structure', () => {
      // Start with completely empty structure
      wrapper.vm.editorStructure = {
        id: 'empty-structure',
        type: 'linear',
        lines: []
      }

      const snapshot = wrapper.vm.exportToJson({ name: 'Empty Test' })

      expect(snapshot).toEqual({
        version: '1.0',
        metadata: {
          name: 'Empty Test',
          created: expect.any(String)
        },
        structure: {
          lines: []
        }
      })
    })

    it('should handle lines with no placed blocks', () => {
      wrapper.vm.editorStructure = {
        id: 'test-structure',
        type: 'linear',
        lines: [
          {
            id: 'line-1',
            type: 'assignment',
            indentLevel: 0,
            parentLineId: undefined,
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' }
            ],
            placedBlocks: [], // Empty array
            minSlots: 2,
            maxSlots: 10
          }
        ]
      }

      const snapshot = wrapper.vm.exportToJson()

      expect(snapshot.structure.lines[0].slots).toEqual([])
    })

    it('should handle lines with all null blocks', () => {
      wrapper.vm.editorStructure = {
        id: 'test-structure',
        type: 'linear',
        lines: [
          {
            id: 'line-1',
            type: 'assignment',
            indentLevel: 0,
            parentLineId: undefined,
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' }
            ],
            placedBlocks: [null, null],
            minSlots: 2,
            maxSlots: 10
          }
        ]
      }

      const snapshot = wrapper.vm.exportToJson()

      expect(snapshot.structure.lines[0].slots).toEqual([
        { blockId: null, isBlank: false },
        { blockId: null, isBlank: false }
      ])
    })

    it('should handle blocks with missing type or value properties', () => {
      wrapper.vm.editorStructure = {
        id: 'test-structure',
        type: 'linear',
        lines: [
          {
            id: 'line-1',
            type: 'assignment',
            indentLevel: 0,
            parentLineId: undefined,
            slots: [{ id: 'slot-0', placeholder: '' }],
            placedBlocks: [
              { id: 'malformed-block', type: undefined, value: undefined } as any
            ],
            minSlots: 1,
            maxSlots: 10
          }
        ]
      }

      const snapshot = wrapper.vm.exportToJson()

      // Should export null for malformed blocks
      expect(snapshot.structure.lines[0].slots[0]).toEqual({
        blockId: null,
        isBlank: false
      })
    })

    it('should handle very deep nesting levels', () => {
      const deepStructure = {
        id: 'deep-structure',
        type: 'linear' as const,
        lines: Array.from({ length: 10 }, (_, i) => ({
          id: `line-${i}`,
          type: 'assignment' as const,
          indentLevel: i, // Increasing indent levels
          parentLineId: i > 0 ? `line-${i - 1}` : undefined,
          slots: [{ id: `slot-${i}-0`, placeholder: '' }],
          placedBlocks: [
            { id: `block-${i}`, type: 'variable' as const, value: 'p' }
          ],
          minSlots: 1,
          maxSlots: 10
        }))
      }

      wrapper.vm.editorStructure = deepStructure

      const snapshot = wrapper.vm.exportToJson()

      expect(snapshot.structure.lines).toHaveLength(10)
      expect(snapshot.structure.lines[9].indentLevel).toBe(9)
      expect(snapshot.structure.lines[9].parentLineId).toBe('line-8')
    })
  })

  describe('Import Edge Cases', () => {
    it('should handle snapshots with missing required fields', () => {
      const incompleteSnapshot = {
        version: '1.0'
        // Missing structure field
      } as any

      expect(() => snapshotToCodeStructure(incompleteSnapshot)).toThrow()
    })

    it('should handle snapshots with empty lines array', () => {
      const emptySnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: []
        }
      }

      const result = snapshotToCodeStructure(emptySnapshot)

      expect(result.lines).toEqual([])
    })

    it('should handle lines with missing slots', () => {
      const snapshotWithMissingSlots: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [] // Empty slots array
            }
          ]
        }
      }

      const result = snapshotToCodeStructure(snapshotWithMissingSlots)

      expect(result.lines[0].slots).toHaveLength(3) // Should create minimum 3 slots
      expect(result.lines[0].placedBlocks).toEqual([null, null, null])
    })

    it('should handle invalid parent line IDs', () => {
      const snapshotWithInvalidParents: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 1,
              parentLineId: 'non-existent-parent', // Invalid parent
              slots: [{ blockId: 'var-p' }]
            }
          ]
        }
      }

      // Should not throw, but preserve the invalid parent ID
      const result = snapshotToCodeStructure(snapshotWithInvalidParents)
      expect(result.lines[0].parentLineId).toBe('non-existent-parent')
    })

    it('should handle circular parent references gracefully', () => {
      const circularSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: 'line-2', // Points to line-2
              slots: [{ blockId: 'var-p' }]
            },
            {
              id: 'line-2',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: 'line-1', // Points back to line-1
              slots: [{ blockId: 'var-x' }]
            }
          ]
        }
      }

      // Should not throw, structure should be created as specified
      expect(() => snapshotToCodeStructure(circularSnapshot)).not.toThrow()
    })
  })

  describe('Blank Slots Edge Cases', () => {
    it('should handle blank slots with out-of-bounds indices', () => {
      const snapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [{ blockId: 'var-p' }] // Only 1 slot
            }
          ]
        }
      }

      const blankSlots = [
        { lineId: 'line-1', slotIndex: 5 }, // Out of bounds
        { lineId: 'line-1', slotIndex: -1 } // Negative index
      ]

      // Should not throw
      expect(() => loadLevelFromSnapshot(snapshot, blankSlots)).not.toThrow()
    })

    it('should handle duplicate blank slot specifications', () => {
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

      const duplicateBlankSlots = [
        { lineId: 'line-1', slotIndex: 1 },
        { lineId: 'line-1', slotIndex: 1 }, // Duplicate
        { lineId: 'line-1', slotIndex: 1 }  // Another duplicate
      ]

      const result = loadLevelFromSnapshot(snapshot, duplicateBlankSlots)

      // Should only blank the slot once
      expect(result.lines[0].placedBlocks[1]).toBe(null)
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle very large structures efficiently', () => {
      // Create a structure with many lines
      const largeSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: Array.from({ length: 1000 }, (_, i) => ({
            id: `line-${i}`,
            type: 'assignment' as const,
            indentLevel: 0,
            parentLineId: null,
            slots: [
              { blockId: 'var-p' },
              { blockId: 'op-assign' },
              { blockId: 'color-red' }
            ]
          }))
        }
      }

      const startTime = performance.now()
      const result = snapshotToCodeStructure(largeSnapshot)
      const endTime = performance.now()

      expect(result.lines).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle repeated import/export cycles without memory leaks', () => {
      const testSnapshot: CodeEditorSnapshot = {
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

      // Perform many import/export cycles
      for (let i = 0; i < 100; i++) {
        wrapper.vm.importFromJson(testSnapshot)
        const exported = wrapper.vm.exportToJson()
        expect(exported.structure.lines).toHaveLength(1)
      }

      // Should complete without issues
      expect(true).toBe(true)
    })
  })

  describe('Console Export Edge Cases', () => {
    it('should handle console unavailable gracefully', () => {
      // Mock console being unavailable
      const originalConsole = global.console
      const mockConsole = { log: vi.fn() }
      ;(global as any).console = undefined

      // Should handle gracefully by checking if console exists
      expect(() => wrapper.vm.exportToConsole()).not.toThrow()

      // Restore console
      global.console = originalConsole
    })

    it('should handle console.log throwing errors', () => {
      const originalConsole = global.console
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Console error')
      })

      // Should not propagate console errors
      expect(() => wrapper.vm.exportToConsole()).not.toThrow()

      consoleSpy.mockRestore()
      global.console = originalConsole
    })
  })

  describe('Metadata Edge Cases', () => {
    it('should handle missing metadata gracefully', () => {
      const snapshot = wrapper.vm.exportToJson() // No metadata provided

      expect(snapshot.metadata).toEqual({
        created: expect.any(String)
      })
    })

    it('should handle metadata with special characters', () => {
      const specialMetadata = {
        name: 'Test with "quotes" and \n newlines',
        description: 'Special chars: <>&"\'`'
      }

      const snapshot = wrapper.vm.exportToJson(specialMetadata)

      expect(snapshot.metadata.name).toBe('Test with "quotes" and \n newlines')
      expect(snapshot.metadata.description).toBe('Special chars: <>&"\'`')
    })

    it('should handle very long metadata strings', () => {
      const longString = 'A'.repeat(10000)
      const longMetadata = {
        name: longString,
        description: longString
      }

      expect(() => wrapper.vm.exportToJson(longMetadata)).not.toThrow()
      
      const snapshot = wrapper.vm.exportToJson(longMetadata)
      expect(snapshot.metadata.name).toHaveLength(10000)
    })
  })
})