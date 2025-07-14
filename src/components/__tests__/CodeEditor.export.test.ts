import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../CodeEditor.vue'
import type { CodeStructure } from '../../types/codeStructures'
import type { CodeEditorSnapshot } from '../../types/codeEditorSnapshot'
import type { CodeBlock } from '../../types/codeBlocks'

describe('CodeEditor Export Functionality', () => {
  let wrapper: any
  
  beforeEach(() => {
    wrapper = mount(CodeEditor, {
      props: {
        template: 'UNIFIED',
        enableEvaluation: false
      }
    })
  })

  describe('exportToJson', () => {
    it('should export basic structure with correct format', () => {
      // Create a simple structure with blocks
      const testStructure: CodeStructure = {
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
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-var-p-123', type: 'variable', value: 'p' },
              { id: 'placed-op-assign-456', type: 'operator', value: '=' },
              { id: 'placed-color-red-789', type: 'color', value: 'red' }
            ] as CodeBlock[],
            minSlots: 3,
            maxSlots: 10
          }
        ]
      }
      
      // Set the structure in the editor
      wrapper.vm.importFromJson({
        version: '1.0',
        structure: {
          lines: testStructure.lines.map(line => ({
            id: line.id,
            type: line.type,
            indentLevel: line.indentLevel,
            parentLineId: line.parentLineId || null,
            slots: line.placedBlocks.map(block => ({
              blockId: block?.type === 'variable' && block?.value === 'p' ? 'var-p' :
                      block?.type === 'operator' && block?.value === '=' ? 'op-assign' :
                      block?.type === 'color' && block?.value === 'red' ? 'color-red' : null,
              isBlank: false
            }))
          }))
        }
      })
      
      const snapshot = wrapper.vm.exportToJson({ name: 'Test Export' })
      
      expect(snapshot).toEqual({
        version: '1.0',
        metadata: {
          name: 'Test Export',
          created: expect.any(String)
        },
        structure: {
          lines: [
            {
              id: expect.any(String),
              type: 'assignment',
              indentLevel: 0,
              parentLineId: null,
              slots: [
                { blockId: 'var-p', isBlank: false },
                { blockId: 'op-assign', isBlank: false },
                { blockId: 'color-red', isBlank: false }
              ]
            }
          ]
        }
      })
    })

    it('should handle empty slots correctly', () => {
      // Create structure with some empty slots
      const testStructure: CodeStructure = {
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
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-var-p-123', type: 'variable', value: 'p' },
              null, // Empty slot
              { id: 'placed-color-red-789', type: 'color', value: 'red' }
            ] as (CodeBlock | null)[],
            minSlots: 3,
            maxSlots: 10
          }
        ]
      }
      
      // Mock the editor structure
      wrapper.vm.editorStructure = testStructure
      
      const snapshot = wrapper.vm.exportToJson()
      
      expect(snapshot.structure.lines[0].slots).toEqual([
        { blockId: 'var-p', isBlank: false },
        { blockId: null, isBlank: false },
        { blockId: 'color-red', isBlank: false }
      ])
    })

    it('should export if-else structure with correct parent relationships', () => {
      const ifElseStructure: CodeStructure = {
        id: 'if-else-structure',
        type: 'linear',
        lines: [
          {
            id: 'line-if',
            type: 'condition',
            indentLevel: 0,
            parentLineId: undefined,
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' },
              { id: 'slot-3', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-ctrl-if-123', type: 'control', value: 'if' },
              { id: 'placed-var-x-456', type: 'variable', value: 'x' },
              { id: 'placed-op-equals-789', type: 'operator', value: '==' },
              { id: 'placed-num-2-012', type: 'number', value: '2' }
            ] as CodeBlock[],
            minSlots: 3,
            maxSlots: 10
          },
          {
            id: 'line-then',
            type: 'assignment',
            indentLevel: 1,
            parentLineId: 'line-if',
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-var-p-345', type: 'variable', value: 'p' },
              { id: 'placed-op-assign-678', type: 'operator', value: '=' },
              { id: 'placed-color-red-901', type: 'color', value: 'red' }
            ] as CodeBlock[],
            minSlots: 3,
            maxSlots: 10
          },
          {
            id: 'line-else',
            type: 'condition',
            indentLevel: 0,
            parentLineId: 'line-if',
            slots: [
              { id: 'slot-0', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-ctrl-else-234', type: 'control', value: 'else' }
            ] as CodeBlock[],
            minSlots: 1,
            maxSlots: 10
          },
          {
            id: 'line-else-body',
            type: 'assignment',
            indentLevel: 1,
            parentLineId: 'line-else',
            slots: [
              { id: 'slot-0', placeholder: '' },
              { id: 'slot-1', placeholder: '' },
              { id: 'slot-2', placeholder: '' }
            ],
            placedBlocks: [
              { id: 'placed-var-p-567', type: 'variable', value: 'p' },
              { id: 'placed-op-assign-890', type: 'operator', value: '=' },
              { id: 'placed-color-blue-123', type: 'color', value: 'blue' }
            ] as CodeBlock[],
            minSlots: 3,
            maxSlots: 10
          }
        ]
      }
      
      wrapper.vm.editorStructure = ifElseStructure
      
      const snapshot = wrapper.vm.exportToJson({ name: 'If-Else Test' })
      
      // Verify the parent relationships are preserved
      expect(snapshot.structure.lines).toHaveLength(4)
      expect(snapshot.structure.lines[0].parentLineId).toBe(null)
      expect(snapshot.structure.lines[1].parentLineId).toBe('line-if')
      expect(snapshot.structure.lines[2].parentLineId).toBe('line-if')
      expect(snapshot.structure.lines[3].parentLineId).toBe('line-else')
      
      // Verify block IDs are correctly mapped
      expect(snapshot.structure.lines[0].slots).toEqual([
        { blockId: 'ctrl-if', isBlank: false },
        { blockId: 'var-x', isBlank: false },
        { blockId: 'op-equals', isBlank: false },
        { blockId: 'num-2', isBlank: false }
      ])
      
      expect(snapshot.structure.lines[2].slots).toEqual([
        { blockId: 'ctrl-else', isBlank: false }
      ])
    })

    it('should include metadata correctly', () => {
      const metadata = {
        name: 'Custom Level',
        description: 'A test level for verification'
      }
      
      const snapshot = wrapper.vm.exportToJson(metadata)
      
      expect(snapshot.metadata).toEqual({
        name: 'Custom Level',
        description: 'A test level for verification',
        created: expect.any(String)
      })
      
      // Verify created date is a valid ISO string
      expect(() => new Date(snapshot.metadata.created)).not.toThrow()
    })

    it('should handle unknown block types gracefully', () => {
      const structureWithUnknownBlock: CodeStructure = {
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
              { id: 'unknown-block-123', type: 'unknown' as any, value: 'mystery' }
            ] as CodeBlock[],
            minSlots: 1,
            maxSlots: 10
          }
        ]
      }
      
      wrapper.vm.editorStructure = structureWithUnknownBlock
      
      const snapshot = wrapper.vm.exportToJson()
      
      // Should export with null blockId for unknown blocks
      expect(snapshot.structure.lines[0].slots[0]).toEqual({
        blockId: null,
        isBlank: false
      })
    })
  })

  describe('exportToConsole', () => {
    it('should call console.log with formatted output', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      const metadata = { name: 'Console Test' }
      const result = wrapper.vm.exportToConsole(metadata)
      
      expect(consoleSpy).toHaveBeenCalledWith('📋 Code Editor Snapshot:')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('"version": "1.0"'))
      expect(consoleSpy).toHaveBeenCalledWith('💡 Copy the above JSON to use as initialCode in level definition!')
      
      expect(result).toEqual(expect.objectContaining({
        version: '1.0',
        metadata: expect.objectContaining({ name: 'Console Test' })
      }))
      
      consoleSpy.mockRestore()
    })
  })
})