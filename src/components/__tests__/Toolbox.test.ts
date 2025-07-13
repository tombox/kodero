import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Toolbox from '../Toolbox.vue'
import CodeBlock from '../CodeBlock.vue'
import type { CodeBlock as CodeBlockType } from '../../types/codeBlocks'

describe('Toolbox', () => {
  const mockBlocks: CodeBlockType[] = [
    { id: 'var-x', type: 'variable', value: 'x' },
    { id: 'var-y', type: 'variable', value: 'y' },
    { id: 'num-1', type: 'number', value: '1' },
    { id: 'num-2', type: 'number', value: '2' },
    { id: 'op-equals', type: 'operator', value: '==' },
    { id: 'color-red', type: 'color', value: 'red' },
    { id: 'color-blue', type: 'color', value: 'blue' },
    { id: 'ctrl-if', type: 'control', value: 'if' }
  ]

  describe('Basic Rendering', () => {
    it('should render correctly with blocks', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks
        }
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('toolbox')
    })

    it('should render all provided blocks', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks
        }
      })
      
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      expect(codeBlocks).toHaveLength(mockBlocks.length)
    })

    it('should pass correct props to CodeBlock components', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 3)
        }
      })
      
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      
      expect(codeBlocks[0].props()).toEqual({
        type: 'variable',
        value: 'x',
        disabled: false
      })
      
      expect(codeBlocks[1].props()).toEqual({
        type: 'variable',
        value: 'y',
        disabled: false
      })
      
      expect(codeBlocks[2].props()).toEqual({
        type: 'number',
        value: '1',
        disabled: false
      })
    })

    it('should handle empty blocks array', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: []
        }
      })
      
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      expect(codeBlocks).toHaveLength(0)
      
      const emptyMessage = wrapper.find('.toolbox__empty')
      expect(emptyMessage.exists()).toBe(true)
      expect(emptyMessage.text()).toContain('No blocks available')
    })
  })

  describe('Block Categories', () => {
    it('should group blocks by category', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          groupByCategory: true
        }
      })
      
      // Should have category sections
      const categories = wrapper.findAll('.toolbox__category')
      expect(categories.length).toBeGreaterThan(0)
      
      // Should have category headers
      const categoryHeaders = wrapper.findAll('.toolbox__category-header')
      expect(categoryHeaders.length).toBeGreaterThan(0)
    })

    it('should display category names correctly', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          groupByCategory: true
        }
      })
      
      const categoryHeaders = wrapper.findAll('.toolbox__category-header h4')
      const categoryNames = categoryHeaders.map(header => header.text())
      
      expect(categoryNames).toContain('Variables')
      expect(categoryNames).toContain('Numbers')
      expect(categoryNames).toContain('Operators')
      expect(categoryNames).toContain('Colors')
      expect(categoryNames).toContain('Control Flow')
    })

    it('should not show categories when groupByCategory is false', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          groupByCategory: false
        }
      })
      
      const categories = wrapper.findAll('.toolbox__category')
      expect(categories).toHaveLength(0)
      
      // Should still render blocks in a flat list
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      expect(codeBlocks).toHaveLength(mockBlocks.length)
    })
  })

  describe('Block Filtering', () => {
    it('should filter blocks by search term', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          searchable: true
        }
      })
      
      const searchInput = wrapper.find('.toolbox__search input')
      expect(searchInput.exists()).toBe(true)
      
      // Search for variables
      await searchInput.setValue('x')
      
      const visibleBlocks = wrapper.findAllComponents(CodeBlock)
      expect(visibleBlocks).toHaveLength(1)
      expect(visibleBlocks[0].props('value')).toBe('x')
    })

    it('should filter blocks by type', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          allowedTypes: ['variable', 'number']
        }
      })
      
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      const types = codeBlocks.map(block => block.props('type'))
      
      expect(types).toEqual(['variable', 'variable', 'number', 'number'])
    })

    it('should show no results message when search has no matches', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          searchable: true
        }
      })
      
      const searchInput = wrapper.find('.toolbox__search input')
      await searchInput.setValue('nonexistent')
      
      const noResults = wrapper.find('.toolbox__no-results')
      expect(noResults.exists()).toBe(true)
      expect(noResults.text()).toContain('No blocks found')
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag start events', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 1)
        }
      })
      
      const codeBlock = wrapper.findComponent(CodeBlock)
      await codeBlock.trigger('dragstart')
      
      expect(wrapper.emitted('block-drag-start')).toBeTruthy()
    })

    it('should provide block data in drag events', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 1)
        }
      })
      
      const codeBlock = wrapper.findComponent(CodeBlock)
      await codeBlock.trigger('dragstart')
      
      const dragEvents = wrapper.emitted('block-drag-start')
      expect(dragEvents![0]).toEqual([mockBlocks[0]])
    })

    it('should support disabled drag state', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 1),
          dragDisabled: true
        }
      })
      
      const codeBlock = wrapper.findComponent(CodeBlock)
      expect(codeBlock.props('disabled')).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks
        }
      })
      
      expect(wrapper.attributes('role')).toBe('toolbar')
      expect(wrapper.attributes('aria-label')).toBe('Code block toolbox')
    })

    it('should have accessible search input', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          searchable: true
        }
      })
      
      const searchInput = wrapper.find('.toolbox__search input')
      expect(searchInput.attributes('aria-label')).toBe('Search code blocks')
      expect(searchInput.attributes('type')).toBe('search')
    })

    it('should support keyboard navigation', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 3)
        }
      })
      
      // Should be able to focus first block
      const firstBlock = wrapper.findAllComponents(CodeBlock)[0]
      await firstBlock.trigger('focus')
      
      // Should handle arrow key navigation (this would be implemented in the component)
      await wrapper.trigger('keydown', { key: 'ArrowRight' })
      
      // For now, just check that the component can receive keyboard events
      expect(wrapper.attributes('tabindex')).toBe('0')
    })
  })

  describe('Block Selection', () => {
    it('should emit selection events when blocks are clicked', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 1)
        }
      })
      
      const codeBlock = wrapper.findComponent(CodeBlock)
      await codeBlock.trigger('click')
      
      expect(wrapper.emitted('block-select')).toBeTruthy()
      expect(wrapper.emitted('block-select')![0]).toEqual([mockBlocks[0]])
    })

    it('should support multiple selection mode', async () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks.slice(0, 3),
          multiSelect: true
        }
      })
      
      const blocks = wrapper.findAllComponents(CodeBlock)
      
      // Select first block
      await blocks[0].trigger('click')
      
      // Select second block with Ctrl
      await blocks[1].trigger('click', { ctrlKey: true })
      
      const selectEvents = wrapper.emitted('block-select')
      expect(selectEvents).toHaveLength(2)
    })
  })

  describe('Responsive Design', () => {
    it('should apply compact layout class on mobile', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          compact: true
        }
      })
      
      expect(wrapper.classes()).toContain('toolbox--compact')
    })

    it('should limit visible blocks in compact mode', () => {
      const wrapper = mount(Toolbox, {
        props: {
          availableBlocks: mockBlocks,
          compact: true,
          maxVisibleBlocks: 4
        }
      })
      
      const codeBlocks = wrapper.findAllComponents(CodeBlock)
      expect(codeBlocks.length).toBeLessThanOrEqual(4)
    })
  })
})