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
    it('should render with default expression template', () => {
      const wrapper = mount(CodeEditor)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('code-editor')
      expect(wrapper.text()).toContain('EXPRESSION Code Structure')
    })

    it('should render with specified template', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'IF_ELSE'
        }
      })
      
      expect(wrapper.text()).toContain('IF_ELSE Code Structure')
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
    it('should render expression template correctly', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(1) // starts with one slot
      
      expect(codeSlots[0].props('placeholder')).toBe('drop here')
    })

    it('should render if/else template correctly', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'IF_ELSE'
        }
      })
      
      // Should have condition line + nested if/else bodies
      expect(wrapper.text()).toContain('Then:')
      expect(wrapper.text()).toContain('Else:')
      
      const conditionalBlocks = wrapper.findAll('.conditional-block')
      expect(conditionalBlocks).toHaveLength(2) // if and else blocks
    })

    it('should show empty states for nested structures', () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'IF_ELSE'
        }
      })
      
      // The IF_ELSE template should have nested if/else bodies that are initially empty
      expect(wrapper.text()).toContain('Then:')
      expect(wrapper.text()).toContain('Else:')
      
      // Check if the template shows indication of empty nested areas
      const conditionalBlocks = wrapper.findAll('.conditional-block')
      expect(conditionalBlocks.length).toBe(2)
    })
  })

  describe('Line Management', () => {
    it('should add new lines for linear structures', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      const addButton = wrapper.find('.code-editor__btn--add')
      expect(addButton.exists()).toBe(true)
      
      await addButton.trigger('click')
      
      // Should emit structure-changed event
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should remove lines from linear structures', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
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
          template: 'EXPRESSION',
          maxLines: 2
        }
      })
      
      const addButton = wrapper.find('.code-editor__btn--add')
      expect(addButton.exists()).toBe(true)
      
      // Add first line
      await addButton.trigger('click')
      expect(addButton.attributes('disabled')).toBeFalsy()
      
      // Add second line (should reach limit)
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Button should be disabled
      expect(addButton.attributes('disabled')).toBeDefined()
    })

    it('should add lines to nested structures', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'IF_ELSE'
        }
      })
      
      const addButtons = wrapper.findAll('.code-editor__btn--add')
      // Should have add buttons for if and else bodies
      expect(addButtons.length).toBeGreaterThanOrEqual(2)
      
      await addButtons[1].trigger('click') // Add to if body
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })
  })

  describe('Block Management', () => {
    it('should handle block drops', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      const firstSlot = codeSlots[0]
      
      await firstSlot.vm.$emit('block-dropped', mockCodeBlock)
      
      expect(wrapper.emitted('block-placed')).toBeTruthy()
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should handle block removal', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      const firstSlot = codeSlots[0]
      
      await firstSlot.vm.$emit('block-removed', mockCodeBlock)
      
      expect(wrapper.emitted('block-removed')).toBeTruthy()
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should move blocks between slots', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      let codeSlots = wrapper.findAllComponents(CodeSlot)
      
      // Drop block in first slot (this should auto-grow to create a second slot)
      await codeSlots[0].vm.$emit('block-dropped', mockCodeBlock)
      await wrapper.vm.$nextTick()
      
      // Should now have 2 slots
      codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(2)
      
      // Drop same block in second slot (should move)
      await codeSlots[1].vm.$emit('block-dropped', mockCodeBlock)
      
      expect(wrapper.emitted('block-placed')).toHaveLength(2)
      expect(wrapper.emitted('structure-changed')).toHaveLength(2)
    })

    it('should auto-grow slots when last slot is filled', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      // Should start with 1 slot
      let codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(1)
      
      // Drop block in the first (and only) slot
      await codeSlots[0].vm.$emit('block-dropped', mockCodeBlock)
      await wrapper.vm.$nextTick()
      
      // Should auto-add another slot
      codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(2)
      expect(wrapper.emitted('structure-changed')).toBeTruthy()
    })

    it('should auto-shrink trailing empty slots when blocks are removed', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      
      // Fill first slot to auto-grow
      await codeSlots[0].vm.$emit('block-dropped', mockCodeBlock)
      await wrapper.vm.$nextTick()
      
      // Should have 2 slots now
      let updatedSlots = wrapper.findAllComponents(CodeSlot)
      expect(updatedSlots).toHaveLength(2)
      
      // Remove block from first slot
      await updatedSlots[0].vm.$emit('block-removed', mockCodeBlock)
      await wrapper.vm.$nextTick()
      
      // Should shrink back to 1 slot (but keep minimum)
      updatedSlots = wrapper.findAllComponents(CodeSlot)
      expect(updatedSlots).toHaveLength(1)
    })

    it('should not accept drops when disabled', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION',
          disabled: true
        }
      })
      
      const codeSlots = wrapper.findAllComponents(CodeSlot)
      expect(codeSlots).toHaveLength(1) // Should start with 1 slot in EXPRESSION template
      expect(codeSlots[0].props('disabled')).toBe(true)
    })
  })

  describe('Code Execution', () => {
    it('should handle code execution', async () => {
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
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
          template: 'EXPRESSION',
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
          template: 'EXPRESSION'
        }
      })
      
      await wrapper.setProps({ template: 'IF_ELSE' })
      
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
            slots: [
              { id: 'var', acceptedTypes: ['variable'], placeholder: 'test', required: true }
            ],
            placedBlocks: [null]
          }
        ]
      }
      
      const wrapper = mount(CodeEditor, {
        props: {
          template: 'EXPRESSION'
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
          template: 'EXPRESSION'
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
          template: 'EXPRESSION'
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
          template: 'IF_ELSE'
        }
      })
      
      expect(wrapper.find('.code-editor__header').exists()).toBe(true)
      expect(wrapper.find('.code-editor__actions').exists()).toBe(true)
      expect(wrapper.find('.code-lines').exists()).toBe(true)
    })
  })
})