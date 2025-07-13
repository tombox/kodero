import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeSlot from '../CodeSlot.vue'
import CodeBlock from '../CodeBlock.vue'
import type { CodeBlock as CodeBlockType } from '../../types/codeBlocks'

describe('CodeSlot', () => {
  const mockCodeBlock: CodeBlockType = {
    id: 'test-block',
    type: 'variable',
    value: 'x'
  }

  describe('Basic Rendering', () => {
    it('should render correctly when empty', () => {
      const wrapper = mount(CodeSlot)
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('code-slot')
      expect(wrapper.classes()).toContain('code-slot--empty')
    })

    it('should render with placed block', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock
        }
      })
      
      expect(wrapper.classes()).toContain('code-slot')
      expect(wrapper.classes()).toContain('code-slot--filled')
      expect(wrapper.classes()).not.toContain('code-slot--empty')
      
      const codeBlock = wrapper.findComponent(CodeBlock)
      expect(codeBlock.exists()).toBe(true)
      expect(codeBlock.props()).toEqual({
        id: 'test-block',
        type: 'variable',
        value: 'x',
        disabled: false
      })
    })

    it('should show placeholder text when empty', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placeholder: 'Drop code block here'
        }
      })
      
      expect(wrapper.text()).toContain('Drop code block here')
    })

    it('should not show placeholder when filled', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock,
          placeholder: 'Drop code block here'
        }
      })
      
      expect(wrapper.text()).not.toContain('Drop code block here')
    })
  })

  describe('Drop Zone Behavior', () => {
    it('should handle dragover events', async () => {
      const wrapper = mount(CodeSlot)
      
      const mockDataTransfer = {
        dropEffect: ''
      }
      
      await wrapper.trigger('dragover', { dataTransfer: mockDataTransfer })
      
      expect(mockDataTransfer.dropEffect).toBe('copy')
      expect(wrapper.classes()).toContain('code-slot--drag-over')
    })

    it('should handle dragenter events', async () => {
      const wrapper = mount(CodeSlot)
      
      await wrapper.trigger('dragenter')
      expect(wrapper.classes()).toContain('code-slot--drag-over')
    })

    it('should handle dragleave events', async () => {
      const wrapper = mount(CodeSlot)
      
      // First enter
      await wrapper.trigger('dragenter')
      expect(wrapper.classes()).toContain('code-slot--drag-over')
      
      // Then leave
      await wrapper.trigger('dragleave')
      expect(wrapper.classes()).not.toContain('code-slot--drag-over')
    })

    it('should handle drop events with valid data', async () => {
      const wrapper = mount(CodeSlot)
      
      const blockData = {
        id: 'dropped-block',
        type: 'number',
        value: '5',
        timestamp: Date.now()
      }
      
      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue(JSON.stringify(blockData))
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer })
      
      expect(wrapper.emitted('block-dropped')).toBeTruthy()
      expect(wrapper.emitted('block-dropped')![0]).toEqual([blockData])
      expect(wrapper.classes()).not.toContain('code-slot--drag-over')
    })

    it('should reject invalid drop data', async () => {
      const wrapper = mount(CodeSlot)
      
      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue('invalid json')
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer })
      
      expect(wrapper.emitted('block-dropped')).toBeFalsy()
      expect(wrapper.emitted('drop-rejected')).toBeTruthy()
    })
  })

  describe('Slot Types and Validation', () => {
    it('should accept any block type by default', async () => {
      const wrapper = mount(CodeSlot)
      
      const blockData = { type: 'variable', value: 'x' }
      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue(JSON.stringify(blockData))
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer })
      expect(wrapper.emitted('block-dropped')).toBeTruthy()
    })

    it('should validate accepted block types', async () => {
      const wrapper = mount(CodeSlot, {
        props: {
          acceptedTypes: ['number', 'operator']
        }
      })
      
      // Test accepted type
      const numberBlock = { type: 'number', value: '5' }
      const mockDataTransfer1 = {
        getData: vi.fn().mockReturnValue(JSON.stringify(numberBlock))
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer1 })
      expect(wrapper.emitted('block-dropped')).toBeTruthy()
      
      // Test rejected type
      const variableBlock = { type: 'variable', value: 'x' }
      const mockDataTransfer2 = {
        getData: vi.fn().mockReturnValue(JSON.stringify(variableBlock))
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer2 })
      expect(wrapper.emitted('drop-rejected')).toBeTruthy()
    })

    it('should show type indicator when specified', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          acceptedTypes: ['number'],
          showTypeIndicator: true
        }
      })
      
      expect(wrapper.find('.code-slot__type-indicator').exists()).toBe(true)
      expect(wrapper.text()).toContain('number')
    })
  })

  describe('Block Removal', () => {
    it('should handle block removal', async () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock
        }
      })
      
      const removeButton = wrapper.find('.code-slot__remove')
      expect(removeButton.exists()).toBe(true)
      
      await removeButton.trigger('click')
      expect(wrapper.emitted('block-removed')).toBeTruthy()
      expect(wrapper.emitted('block-removed')![0]).toEqual([mockCodeBlock])
    })

    it('should not show remove button when disabled', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock,
          disabled: true
        }
      })
      
      const removeButton = wrapper.find('.code-slot__remove')
      expect(removeButton.exists()).toBe(false)
    })

    it('should handle keyboard removal', async () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock
        }
      })
      
      await wrapper.trigger('keydown', { key: 'Delete' })
      expect(wrapper.emitted('block-removed')).toBeTruthy()
      
      await wrapper.trigger('keydown', { key: 'Backspace' })
      expect(wrapper.emitted('block-removed')).toHaveLength(2)
    })
  })

  describe('Disabled State', () => {
    it('should not accept drops when disabled', async () => {
      const wrapper = mount(CodeSlot, {
        props: {
          disabled: true
        }
      })
      
      expect(wrapper.classes()).toContain('code-slot--disabled')
      
      const blockData = { type: 'variable', value: 'x' }
      const mockDataTransfer = {
        getData: vi.fn().mockReturnValue(JSON.stringify(blockData))
      }
      
      await wrapper.trigger('drop', { dataTransfer: mockDataTransfer })
      expect(wrapper.emitted('block-dropped')).toBeFalsy()
    })

    it('should not show drag feedback when disabled', async () => {
      const wrapper = mount(CodeSlot, {
        props: {
          disabled: true
        }
      })
      
      await wrapper.trigger('dragover')
      expect(wrapper.classes()).not.toContain('code-slot--drag-over')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placeholder: 'Drop variable here'
        }
      })
      
      expect(wrapper.attributes('role')).toBe('button')
      expect(wrapper.attributes('aria-label')).toContain('Drop variable here')
      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('should have dropzone ARIA attribute', () => {
      const wrapper = mount(CodeSlot)
      expect(wrapper.attributes('aria-dropeffect')).toBe('copy')
    })

    it('should update ARIA attributes when filled', () => {
      const wrapper = mount(CodeSlot, {
        props: {
          placedBlock: mockCodeBlock
        }
      })
      
      expect(wrapper.attributes('aria-label')).toContain('variable x')
    })

    it('should be keyboard accessible', async () => {
      const wrapper = mount(CodeSlot)
      
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('activate')).toBeTruthy()
      
      await wrapper.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('activate')).toHaveLength(2)
    })
  })

  describe('Size Variants', () => {
    it('should apply size classes', () => {
      const smallWrapper = mount(CodeSlot, {
        props: { size: 'small' }
      })
      expect(smallWrapper.classes()).toContain('code-slot--small')
      
      const largeWrapper = mount(CodeSlot, {
        props: { size: 'large' }
      })
      expect(largeWrapper.classes()).toContain('code-slot--large')
    })
  })
})