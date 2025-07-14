import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../components/CodeEditor.vue'
import { snapshotToCodeStructure, loadLevelFromSnapshot } from '../utils/codeSnapshotLoader'
import type { CodeEditorSnapshot } from '../types/codeEditorSnapshot'
import type { CodeStructure } from '../types/codeStructures'

describe('Export/Import Integration Tests', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(CodeEditor, {
      props: {
        template: 'UNIFIED',
        enableEvaluation: false
      }
    })
  })

  describe('Round-trip Export/Import', () => {
    it('should preserve simple assignment structure through export/import cycle', async () => {
      // Start with a known structure
      const originalSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        metadata: {
          name: 'Simple Assignment Test',
          created: '2025-07-14T08:00:00.000Z'
        },
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

      // Import into editor
      const codeStructure = snapshotToCodeStructure(originalSnapshot)
      wrapper.vm.importFromJson(originalSnapshot)

      // Export from editor
      const exportedSnapshot = wrapper.vm.exportToJson({
        name: 'Simple Assignment Test'
      })

      // Verify core structure is preserved
      expect(exportedSnapshot.structure.lines).toHaveLength(1)
      expect(exportedSnapshot.structure.lines[0]).toEqual({
        id: expect.any(String),
        type: 'assignment',
        indentLevel: 0,
        parentLineId: null,
        slots: [
          { blockId: 'var-p', isBlank: false },
          { blockId: 'op-assign', isBlank: false },
          { blockId: 'color-red', isBlank: false }
        ]
      })

      // Import the exported structure back
      const reimportedStructure = snapshotToCodeStructure(exportedSnapshot)

      // Verify blocks are correctly recreated
      expect(reimportedStructure.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }),
        expect.objectContaining({ type: 'operator', value: '=' }),
        expect.objectContaining({ type: 'color', value: 'red' })
      ])
    })

    it('should preserve if-else structure with correct parent relationships', async () => {
      const ifElseSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-if',
              type: 'condition',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'ctrl-if' },
                { blockId: 'var-x' },
                { blockId: 'op-equals' },
                { blockId: 'num-2' }
              ]
            },
            {
              id: 'line-then',
              type: 'assignment',
              indentLevel: 1,
              parentLineId: 'line-if',
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-red' }
              ]
            },
            {
              id: 'line-else',
              type: 'condition',
              indentLevel: 0,
              parentLineId: 'line-if',
              slots: [
                { blockId: 'ctrl-else' }
              ]
            },
            {
              id: 'line-else-body',
              type: 'assignment',
              indentLevel: 1,
              parentLineId: 'line-else',
              slots: [
                { blockId: 'var-p' },
                { blockId: 'op-assign' },
                { blockId: 'color-blue' }
              ]
            }
          ]
        }
      }

      // Import → Export → Import cycle
      wrapper.vm.importFromJson(ifElseSnapshot)
      const exported = wrapper.vm.exportToJson({ name: 'If-Else Test' })
      const reimported = snapshotToCodeStructure(exported)

      // Verify structure integrity
      expect(reimported.lines).toHaveLength(4)

      // Verify parent relationships are preserved
      const ifLine = reimported.lines.find(line => line.id.includes('line-if') || 
        (line.placedBlocks[0] && line.placedBlocks[0].type === 'control' && line.placedBlocks[0].value === 'if'))
      const thenLine = reimported.lines.find(line => line.parentLineId === ifLine?.id && line.indentLevel === 1)
      const elseLine = reimported.lines.find(line => line.parentLineId === ifLine?.id && 
        (line.placedBlocks[0] && line.placedBlocks[0].type === 'control' && line.placedBlocks[0].value === 'else'))
      const elseBodyLine = reimported.lines.find(line => line.parentLineId === elseLine?.id)

      expect(ifLine).toBeDefined()
      expect(thenLine).toBeDefined()
      expect(elseLine).toBeDefined()
      expect(elseBodyLine).toBeDefined()

      // Verify block content is preserved
      if (ifLine) {
        expect(ifLine.placedBlocks).toEqual([
          expect.objectContaining({ type: 'control', value: 'if' }),
          expect.objectContaining({ type: 'variable', value: 'x' }),
          expect.objectContaining({ type: 'operator', value: '==' }),
          expect.objectContaining({ type: 'number', value: '2' })
        ])
      }

      if (elseLine) {
        expect(elseLine.placedBlocks[0]).toEqual(
          expect.objectContaining({ type: 'control', value: 'else' })
        )
      }
    })

    it('should handle blank slots correctly in round-trip', async () => {
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
                { blockId: null }, // Empty slot
                { blockId: 'color-red' }
              ]
            }
          ]
        }
      }

      // Import structure with empty slot
      wrapper.vm.importFromJson(snapshotWithBlanks)
      
      // Export should preserve the empty slot
      const exported = wrapper.vm.exportToJson()
      
      expect(exported.structure.lines[0].slots).toEqual([
        { blockId: 'var-p', isBlank: false },
        { blockId: null, isBlank: false },
        { blockId: 'color-red', isBlank: false }
      ])

      // Re-import should recreate the structure correctly
      const reimported = snapshotToCodeStructure(exported)
      
      expect(reimported.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }),
        null,
        expect.objectContaining({ type: 'color', value: 'red' })
      ])
    })

    it('should preserve metadata through export cycles', async () => {
      const metadata = {
        name: 'Metadata Test Level',
        description: 'Testing metadata preservation'
      }

      // Export with metadata
      const exported = wrapper.vm.exportToJson(metadata)
      
      expect(exported.metadata).toEqual({
        name: 'Metadata Test Level',
        description: 'Testing metadata preservation',
        created: expect.any(String)
      })

      // Re-export should allow new metadata
      wrapper.vm.importFromJson(exported)
      
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const reExported = wrapper.vm.exportToJson({
        name: 'Updated Name',
        description: 'Updated description'
      })

      expect(reExported.metadata.name).toBe('Updated Name')
      expect(reExported.metadata.description).toBe('Updated description')
      expect(reExported.metadata.created).not.toBe(exported.metadata.created)
    })
  })

  describe('Level Loading Integration', () => {
    it('should correctly load level with blank slots for puzzle creation', async () => {
      const fullSolution: CodeEditorSnapshot = {
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

      // Define which slots should be blank for the puzzle
      const blankSlots = [
        { lineId: 'line-1', slotIndex: 2 } // Make color blank
      ]

      // Load as level with blanks
      const levelStructure = loadLevelFromSnapshot(fullSolution, blankSlots)
      wrapper.vm.importFromJson({
        ...fullSolution,
        structure: {
          lines: levelStructure.lines.map(line => ({
            id: line.id,
            type: line.type,
            indentLevel: line.indentLevel,
            parentLineId: line.parentLineId || null,
            slots: line.placedBlocks.map(block => ({
              blockId: block ? (
                block.type === 'variable' && block.value === 'p' ? 'var-p' :
                block.type === 'operator' && block.value === '=' ? 'op-assign' :
                null
              ) : null,
              isBlank: false
            }))
          }))
        }
      })

      // Should have the specified slots as blanks
      const editorStructure = wrapper.vm.editorStructure
      expect(editorStructure.lines[0].placedBlocks).toEqual([
        expect.objectContaining({ type: 'variable', value: 'p' }),
        expect.objectContaining({ type: 'operator', value: '=' }),
        null // This should be blank
      ])
    })

    it('should maintain structural integrity when converting between formats', async () => {
      // Test with complex nested structure
      const complexSnapshot: CodeEditorSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'condition',
              indentLevel: 0,
              parentLineId: null,
              slots: [{ blockId: 'ctrl-if' }, { blockId: 'var-x' }, { blockId: 'op-greater' }, { blockId: 'num-2' }]
            },
            {
              id: 'line-2',
              type: 'condition',
              indentLevel: 1,
              parentLineId: 'line-1',
              slots: [{ blockId: 'ctrl-if' }, { blockId: 'var-y' }, { blockId: 'op-less' }, { blockId: 'num-3' }]
            },
            {
              id: 'line-3',
              type: 'assignment',
              indentLevel: 2,
              parentLineId: 'line-2',
              slots: [{ blockId: 'var-p' }, { blockId: 'op-assign' }, { blockId: 'color-green' }]
            },
            {
              id: 'line-4',
              type: 'condition',
              indentLevel: 1,
              parentLineId: 'line-2',
              slots: [{ blockId: 'ctrl-else' }]
            },
            {
              id: 'line-5',
              type: 'assignment',
              indentLevel: 2,
              parentLineId: 'line-4',
              slots: [{ blockId: 'var-p' }, { blockId: 'op-assign' }, { blockId: 'color-yellow' }]
            }
          ]
        }
      }

      // Convert to CodeStructure
      const codeStructure = snapshotToCodeStructure(complexSnapshot)
      
      // Import into editor
      wrapper.vm.importFromJson(complexSnapshot)
      
      // Export back
      const exported = wrapper.vm.exportToJson()
      
      // Should maintain all parent-child relationships
      expect(exported.structure.lines).toHaveLength(5)
      
      // Verify indentation levels are preserved
      const indentLevels = exported.structure.lines.map(line => line.indentLevel)
      expect(indentLevels).toEqual([0, 1, 2, 1, 2])
      
      // Verify parent relationships are preserved
      const parentIds = exported.structure.lines.map(line => line.parentLineId)
      expect(parentIds[0]).toBe(null) // Root
      expect(parentIds[1]).toBe(exported.structure.lines[0].id) // Child of root
      expect(parentIds[2]).toBe(exported.structure.lines[1].id) // Child of line-2
      expect(parentIds[3]).toBe(exported.structure.lines[1].id) // Sibling of line-3 (else)
      expect(parentIds[4]).toBe(exported.structure.lines[3].id) // Child of else
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid snapshots gracefully', async () => {
      const invalidSnapshot = {
        version: '1.0',
        structure: {
          lines: [
            {
              id: 'line-1',
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'invalid-block-that-does-not-exist' }
              ]
            }
          ]
        }
      } as CodeEditorSnapshot

      // Should not throw
      expect(() => snapshotToCodeStructure(invalidSnapshot)).not.toThrow()
      
      const result = snapshotToCodeStructure(invalidSnapshot)
      expect(result.lines[0].placedBlocks[0]).toBe(null)
    })

    it('should handle import errors gracefully', async () => {
      const malformedSnapshot = {
        version: '2.0', // Different version
        structure: {
          lines: 'invalid' // Invalid structure
        }
      } as any

      // Should handle gracefully
      expect(() => wrapper.vm.importFromJson(malformedSnapshot)).toThrow()
    })
  })
})