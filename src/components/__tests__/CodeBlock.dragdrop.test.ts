import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeBlock from '../CodeBlock.vue'

describe('CodeBlock - Drag & Drop', () => {
  const mockDataTransfer = {
    setData: vi.fn(),
    getData: vi.fn(),
    effectAllowed: '',
    dropEffect: '',
    types: [],
    files: [],
    items: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Drag Start', () => {
    it('should set correct drag data on dragstart', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragstart', { dataTransfer: mockDataTransfer })

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        expect.stringContaining('"type":"variable"')
      )
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'x'
      )
      expect(mockDataTransfer.effectAllowed).toBe('copy')
    })

    it('should emit dragstart event with block data', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'number',
          value: '5'
        }
      })

      await wrapper.trigger('dragstart')

      expect(wrapper.emitted('dragstart')).toBeTruthy()
      const emittedEvent = wrapper.emitted('dragstart')![0][0] as any
      expect(emittedEvent.blockData).toEqual({
        type: 'number',
        value: '5',
        id: expect.any(String),
        timestamp: expect.any(Number)
      })
    })

    it('should add dragging class during drag', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragstart')
      expect(wrapper.classes()).toContain('code-block--dragging')
    })

    it('should not drag when disabled', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x',
          disabled: true
        }
      })

      expect(wrapper.attributes('draggable')).toBe('false')
      
      // When disabled, dragstart shouldn't set data
      await wrapper.trigger('dragstart', { dataTransfer: mockDataTransfer })
      expect(mockDataTransfer.setData).not.toHaveBeenCalled()
    })
  })

  describe('Drag End', () => {
    it('should remove dragging class on dragend', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragstart')
      expect(wrapper.classes()).toContain('code-block--dragging')

      await wrapper.trigger('dragend')
      expect(wrapper.classes()).not.toContain('code-block--dragging')
    })

    it('should emit dragend event', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragend')
      expect(wrapper.emitted('dragend')).toBeTruthy()
    })
  })

  describe('Visual Feedback', () => {
    it('should have proper drag cursor when draggable', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      expect(wrapper.attributes('draggable')).toBe('true')
      expect(wrapper.classes()).toContain('code-block--draggable')
    })

    it('should not have drag cursor when disabled', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x',
          disabled: true
        }
      })

      expect(wrapper.attributes('draggable')).toBe('false')
      expect(wrapper.classes()).not.toContain('code-block--draggable')
    })

    it('should show drag preview with proper styling', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'color',
          value: 'red'
        }
      })

      await wrapper.trigger('dragstart')
      
      // Should maintain visual styling during drag
      expect(wrapper.classes()).toContain('code-block--color')
      expect(wrapper.classes()).toContain('code-block--dragging')
    })
  })

  describe('Drag Data Format', () => {
    it('should include unique ID in drag data', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'operator',
          value: '=='
        }
      })

      await wrapper.trigger('dragstart', { dataTransfer: mockDataTransfer })

      const setDataCall = mockDataTransfer.setData.mock.calls[0]
      const dragData = JSON.parse(setDataCall[1])
      
      expect(dragData).toHaveProperty('id')
      expect(dragData.id).toMatch(/^code-block-/)
      expect(dragData.type).toBe('operator')
      expect(dragData.value).toBe('==')
    })

    it('should include timestamp for drag tracking', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'control',
          value: 'if'
        }
      })

      await wrapper.trigger('dragstart', { dataTransfer: mockDataTransfer })

      const setDataCall = mockDataTransfer.setData.mock.calls[0]
      const dragData = JSON.parse(setDataCall[1])
      
      expect(dragData).toHaveProperty('timestamp')
      expect(typeof dragData.timestamp).toBe('number')
    })

    it('should handle different MIME types', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragstart', { dataTransfer: mockDataTransfer })

      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        expect.any(String)
      )
      expect(mockDataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'x'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for drag', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      expect(wrapper.attributes('aria-grabbed')).toBe('false')
      expect(wrapper.attributes('role')).toBe('button')
    })

    it('should update aria-grabbed during drag', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      await wrapper.trigger('dragstart')
      expect(wrapper.attributes('aria-grabbed')).toBe('true')

      await wrapper.trigger('dragend')
      expect(wrapper.attributes('aria-grabbed')).toBe('false')
    })

    it('should be keyboard accessible for drag initiation', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })

      // Simulate keyboard drag initiation (Ctrl+D or similar)
      await wrapper.trigger('keydown', { key: 'd', ctrlKey: true })
      expect(wrapper.emitted('drag-keyboard-start')).toBeTruthy()
    })
  })
})