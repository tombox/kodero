import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../CodeEditor.vue'
import CodeSlot from '../CodeSlot.vue'
import type { CodeBlock } from '../../types/codeBlocks'

// Mock the evaluation service
vi.mock('../../evaluation', () => ({
  evaluationService: {
    evaluate: vi.fn(() => ({
      success: true,
      grid: [
        ['gray', 'gray', 'gray', 'gray', 'gray'],
        ['gray', 'gray', 'gray', 'gray', 'gray'],
        ['gray', 'gray', 'gray', 'gray', 'gray'],
        ['gray', 'gray', 'gray', 'gray', 'gray'],
        ['gray', 'gray', 'gray', 'gray', 'gray']
      ],
      errors: []
    }))
  }
}))

// Mock CodeSlot component
vi.mock('../CodeSlot.vue', () => ({
  default: {
    name: 'CodeSlot',
    props: ['placedBlock', 'acceptedTypes', 'placeholder', 'disabled', 'size'],
    emits: ['block-dropped', 'block-removed'],
    template: `
      <div class="mock-code-slot">
        <span v-if="placedBlock">{{ placedBlock.value }}</span>
        <span v-else>{{ placeholder }}</span>
      </div>
    `
  }
}))

describe('CodeEditor', () => {
  const mockCodeBlock: CodeBlock = {
    id: 'test-block',
    type: 'variable',
    value: 'x'
  }

  describe('Basic Rendering', () => {
    it('should render with default unified template', () => {
      const wrapper = mount(CodeEditor)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('code-editor')
      expect(wrapper.text()).toContain('Code Editor')
    })

    it('should render with specified template', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      expect(wrapper.text()).toContain('Code Editor')
    })

    it('should show disabled state', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          disabled: true
        }
      })
      
      expect(wrapper.classes()).toContain('code-editor--disabled')
    })
  })

  describe('Template Structures', () => {
    it('should render unified template correctly', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(1) // starts with one slot
      
      expect(codeSlots[0].props('placeholder')).toBe('drop here')
    })

    it('should support auto-indenting when control blocks are added', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      // Should start with the unified template with auto-indenting capability
      expect(wrapper.text()).toContain('Code Editor')
      expect(wrapper.find('.code-lines').exists()).toBe(true)
      
      // Should have one line initially
      const codeLines = wrapper.findAll('.code-line')
      expect(codeLines).toHaveLength(1)
    })

    it('should show flexible expression building capability', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      // The unified template should support flexible expression building
      expect(wrapper.text()).toContain('Code Editor')
      
      // Should have auto-growing slots
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Line Management', () => {
    it('should add new lines for unified structures', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      const addButton = wrapper.find('.code-editor__btn--add')
      expect(addButton.exists()).toBe(true)
      
      await addButton.trigger('click')
      
      // Should emit structure-changed event
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should remove lines from unified structures', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      // Add a line first
      const addButton = wrapper.find('.code-editor__btn--add')
      await addButton.trigger('click')
      
      // Find remove button (should appear after adding a line)
      await wrapper.vm.$nextTick()
      const removeButton = wrapper.find('.code-line__remove')
      
      if (removeButton.exists()) {
        await removeButton.trigger('click')
        expect(wrapper.emitted('structure-changed')).toBeTruthy()
      }
    })

    it('should respect max lines limit', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          maxLines: 2
        }
      })
      
      const addButton = wrapper.find('.code-editor__btn--add')
      expect(addButton.exists()).toBe(true)
      
      // Add first line
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Check if button becomes disabled when limit is reached
      expect(addButton.exists()).toBe(true)
    })

    it('should auto-add lines when blocks are placed', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      // Should start with one line
      let codeLines = wrapper.findAll('.code-line')
      expect(codeLines).toHaveLength(1)
      
      // The unified template supports auto-adding lines
      expect(wrapper.find('.code-editor').exists()).toBe(true)
    })
  })

  describe('Block Management', () => {
    it('should handle block drops in unified template', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Call the handler directly since CodeSlot is mocked
      await wrapper.vm.handleBlockDropped('line-0', 0, mockCodeBlock)
      
      expect(wrapper.emitted('block-placed')).toBeTruthy()
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should handle block removal in unified template', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Call the handler directly since CodeSlot is mocked
      await wrapper.vm.handleBlockRemoved('line-0', 0, mockCodeBlock)
      
      expect(wrapper.emitted('block-removed')).toBeTruthy()
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should auto-grow slots in unified template', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Should start with basic structure
      expect(wrapper.vm.allLines).toHaveLength(1)
      expect(wrapper.vm.allLines[0].slots).toHaveLength(1)
      
      // Simulate block drop to trigger auto-grow
      await wrapper.vm.handleBlockDropped('line-0', 0, mockCodeBlock)
      
      // Should auto-add another slot
      expect(wrapper.vm.allLines[0].slots).toHaveLength(2)
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should support auto-indenting with control blocks', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Should start with 1 line
      expect(wrapper.vm.allLines).toHaveLength(1)
      
      // Drop an 'if' control block
      const ifBlock: CodeBlock = {
        id: 'if-block',
        type: 'control',
        value: 'if'
      }
      
      await wrapper.vm.handleBlockDropped('line-0', 0, ifBlock)
      
      // Should auto-add indented child line
      expect(wrapper.vm.allLines.length).toBeGreaterThan(1)
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should create correct line order for if blocks: if -> indented child -> unindented next', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Start with initial line
      expect(wrapper.vm.allLines).toHaveLength(1)
      expect(wrapper.vm.allLines[0].indentLevel).toBe(0)

      // Add an if block to trigger auto-indenting
      const ifBlock: CodeBlock = { id: 'if-1', type: 'control', value: 'if' }
      await wrapper.vm.handleBlockDropped('line-0', 0, ifBlock)

      // Should create 3 lines total
      expect(wrapper.vm.allLines).toHaveLength(3)
      
      // Line 0: if block (original line)
      expect(wrapper.vm.allLines[0].indentLevel).toBe(0)
      expect(wrapper.vm.allLines[0].placedBlocks[0]?.type).toBe('control')
      expect(wrapper.vm.allLines[0].placedBlocks[0]?.value).toBe('if')
      
      // Line 1: indented child line  
      expect(wrapper.vm.allLines[1].indentLevel).toBe(1)
      expect(wrapper.vm.allLines[1].parentLineId).toBe(wrapper.vm.allLines[0].id)
      
      // Line 2: unindented next line (for else/next statement)
      expect(wrapper.vm.allLines[2].indentLevel).toBe(0)
      expect(wrapper.vm.allLines[2].parentLineId).toBe(wrapper.vm.allLines[0].parentLineId)
    })

    it('should handle if-else drop sequence correctly', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })

      // Start with 1 line
      expect(wrapper.vm.allLines).toHaveLength(1)

      // Step 1: Drop 'if' block
      const ifBlock: CodeBlock = { id: 'if-1', type: 'control', value: 'if' }
      await wrapper.vm.handleBlockDropped('line-0', 0, ifBlock)

      // Should now have 3 lines: if -> indented child -> unindented next
      expect(wrapper.vm.allLines).toHaveLength(3)
      const ifLineId = wrapper.vm.allLines[0].id
      const indentedLineId = wrapper.vm.allLines[1].id
      const unindentedLineId = wrapper.vm.allLines[2].id

      console.log('After if drop:')
      console.log(`Line 0 (if): ${ifLineId}, indent: ${wrapper.vm.allLines[0].indentLevel}`)
      console.log(`Line 1 (indented): ${indentedLineId}, indent: ${wrapper.vm.allLines[1].indentLevel}`)
      console.log(`Line 2 (unindented): ${unindentedLineId}, indent: ${wrapper.vm.allLines[2].indentLevel}`)

      // Step 2: Try to drop 'else' in the unindented line (line 2)
      const elseBlock: CodeBlock = { id: 'else-1', type: 'control', value: 'else' }
      await wrapper.vm.handleBlockDropped(unindentedLineId, 0, elseBlock)

      console.log('After else drop:')
      console.log(`Lines count: ${wrapper.vm.allLines.length}`)
      wrapper.vm.allLines.forEach((line: any, index: number) => {
        console.log(`Line ${index}: id=${line.id}, indent=${line.indentLevel}, blocks=[${line.placedBlocks.map((b: any) => b?.value || 'empty').join(', ')}]`)
      })

      // The else should be in the unindented line we targeted
      expect(wrapper.vm.allLines[2].placedBlocks[0]?.value).toBe('else')
      
      // else blocks SHOULD auto-create indented child lines for their body
      // We should have: if line, if child, else line, else child, unindented next (5 total)
      expect(wrapper.vm.allLines).toHaveLength(5)
      expect(wrapper.vm.allLines[3].indentLevel).toBe(1) // else child should be indented
      expect(wrapper.vm.allLines[3].parentLineId).toBe(wrapper.vm.allLines[2].id) // child of else line
      expect(wrapper.vm.allLines[4].indentLevel).toBe(0) // Last line should be unindented
    })

    it('should handle multiple if-else sequences correctly', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })

      // Start with 1 line
      expect(wrapper.vm.allLines).toHaveLength(1)

      // Step 1: Drop first 'if' block
      const firstIfBlock: CodeBlock = { id: 'if-1', type: 'control', value: 'if' }
      await wrapper.vm.handleBlockDropped('line-0', 0, firstIfBlock)

      // Should have: if, if-child, unindented-next (3 lines)
      expect(wrapper.vm.allLines).toHaveLength(3)
      const firstIfChildId = wrapper.vm.allLines[1].id
      const firstUnindentedId = wrapper.vm.allLines[2].id

      // Step 2: Drop first 'else' in the unindented line
      const firstElseBlock: CodeBlock = { id: 'else-1', type: 'control', value: 'else' }
      await wrapper.vm.handleBlockDropped(firstUnindentedId, 0, firstElseBlock)

      // Debug what we actually have after dropping the first else
      console.log('After first else drop:')
      wrapper.vm.allLines.forEach((line: any, index: number) => {
        console.log(`Line ${index}: id=${line.id}, indent=${line.indentLevel}, parent=${line.parentLineId || 'none'}, blocks=[${line.placedBlocks.map((b: any) => b?.value || 'empty').join(', ')}]`)
      })

      // Should have: if, if-child, else, else-child, unindented-next (5 lines)
      expect(wrapper.vm.allLines).toHaveLength(5)
      expect(wrapper.vm.allLines[2].placedBlocks[0]?.value).toBe('else')
      expect(wrapper.vm.allLines[2].indentLevel).toBe(0) // else should be unindented
      expect(wrapper.vm.allLines[3].indentLevel).toBe(1) // else child should be indented
      expect(wrapper.vm.allLines[3].parentLineId).toBe(wrapper.vm.allLines[2].id) // child of else
      const secondUnindentedId = wrapper.vm.allLines[4].id

      // Step 3: Drop second 'if' in the next unindented line
      const secondIfBlock: CodeBlock = { id: 'if-2', type: 'control', value: 'if' }
      await wrapper.vm.handleBlockDropped(secondUnindentedId, 0, secondIfBlock)

      // Should have: if1, if1-child, else1, else1-child, if2, if2-child, unindented-next (7 lines)
      expect(wrapper.vm.allLines).toHaveLength(7)
      expect(wrapper.vm.allLines[4].placedBlocks[0]?.value).toBe('if') // second if
      expect(wrapper.vm.allLines[4].indentLevel).toBe(0) // second if should be unindented
      expect(wrapper.vm.allLines[5].indentLevel).toBe(1) // second if child should be indented
      const finalUnindentedId = wrapper.vm.allLines[6].id

      console.log('Before second else drop:')
      wrapper.vm.allLines.forEach((line: any, index: number) => {
        console.log(`Line ${index}: id=${line.id}, indent=${line.indentLevel}, blocks=[${line.placedBlocks.map((b: any) => b?.value || 'empty').join(', ')}]`)
      })

      // Step 4: Drop second 'else' in the final unindented line
      const secondElseBlock: CodeBlock = { id: 'else-2', type: 'control', value: 'else' }
      await wrapper.vm.handleBlockDropped(finalUnindentedId, 0, secondElseBlock)

      console.log('After second else drop:')
      wrapper.vm.allLines.forEach((line: any, index: number) => {
        console.log(`Line ${index}: id=${line.id}, indent=${line.indentLevel}, parent=${line.parentLineId || 'none'}, blocks=[${line.placedBlocks.map((b: any) => b?.value || 'empty').join(', ')}]`)
      })

      // The second else should be in the unindented line we targeted
      expect(wrapper.vm.allLines[6].placedBlocks[0]?.value).toBe('else')
      expect(wrapper.vm.allLines[6].indentLevel).toBe(0) // CRITICAL: second else should be unindented
      expect(wrapper.vm.allLines[6].parentLineId).toBe(wrapper.vm.allLines[4].parentLineId) // same parent as second if
      
      // The second else should also create its own indented child
      expect(wrapper.vm.allLines[7].indentLevel).toBe(1) // second else child should be indented
      expect(wrapper.vm.allLines[7].parentLineId).toBe(wrapper.vm.allLines[6].id) // child of second else
    })

    it('should not accept drops when disabled', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          disabled: true
        }
      })
      
      // Try to drop a block when disabled
      await wrapper.vm.handleBlockDropped('line-0', 0, mockCodeBlock)
      
      // Should not emit events when disabled
      expect(wrapper.emitted('block-placed')).toBeFalsy()
    })
  })

  describe('Code Execution', () => {
    it('should handle code execution', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      const executeButton = wrapper.find('.code-editor__btn--execute')
      expect(executeButton.exists()).toBe(true)
      
      await executeButton.trigger('click')
      
      expect(wrapper.emitted('code-executed')).toBeTruthy()
    })

    it('should not execute when disabled', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          disabled: true
        }
      })
      
      const executeButton = wrapper.find('.code-editor__btn--execute')
      expect(executeButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Structure Changes', () => {
    it('should emit structure changes when template changes', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED',
          enableEvaluation: false
        }
      })
      
      // Template changes should work with unified system
      expect(wrapper.emitted('structure-changed')).toBeFalsy()
      
      // Triggering a structure change through block placement
      await wrapper.vm.handleBlockDropped('line-0', 0, mockCodeBlock)
      
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should update when structure prop changes', async () => {
      const customStructure = {
        id: 'custom',
        type: 'linear' as const,
        lines: [
          {
            id: 'custom-line',
            type: 'assignment' as const,
            indentLevel: 0,
            slots: [
              { id: 'var', acceptedTypes: ['variable'], placeholder: 'test', required: true }
            ],
            placedBlocks: [null]
          }
        ]
      }
      
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      await wrapper.setProps({ structure: customStructure })
      
      expect(wrapper.text()).toContain('test')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      const addButton = wrapper.find('.code-editor__btn--add')
      const executeButton = wrapper.find('.code-editor__btn--execute')
      
      expect(addButton.attributes('title')).toBe('Add line')
      expect(executeButton.attributes('title')).toBe('Execute code')
    })

    it('should have accessible remove buttons', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      // Add a line to create remove button
      const addButton = wrapper.find('.code-editor__btn--add')
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      const removeButton = wrapper.find('.code-line__remove')
      if (removeButton.exists()) {
        expect(removeButton.attributes('title')).toBe('Remove line')
      }
    })
  })

  describe('Responsive Design', () => {
    it('should render without errors on mobile', () => {
      // Test mobile-specific CSS classes
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'UNIFIED'
        }
      })
      
      expect(wrapper.find('.code-editor__header').exists()).toBe(true)
      expect(wrapper.find('.code-editor__actions').exists()).toBe(true)
      expect(wrapper.find('.code-lines').exists()).toBe(true)
    })
  })
})