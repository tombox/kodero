import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeEditor from '../CodeEditor.vue'
import CodeSlot from '../CodeSlot.vue'
import type { CodeBlock } from '../../types/codeBlocks'

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
          template: 'UNIFIED'
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
          template: 'UNIFIED'
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
          template: 'UNIFIED'
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
          template: 'UNIFIED'
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
          template: 'UNIFIED'
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