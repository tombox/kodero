import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import Toolbox from '../Toolbox.vue'
import CodeBlock from '../CodeBlock.vue'
import { AVAILABLE_BLOCKS } from '../../types/codeBlocks'
import type { CodeBlock as CodeBlockType } from '../../types/codeBlocks'

// Integration test component that uses both Toolbox and CodeBlocks
const CodeBlockSystemTest = defineComponent({
  components: {
    Toolbox,
    CodeBlock
  },
  data() {
    return {
      availableBlocks: AVAILABLE_BLOCKS.slice(0, 20), // Use subset for testing
      selectedBlocks: [] as CodeBlockType[],
      draggedBlock: null as CodeBlockType | null
    }
  },
  methods: {
    handleBlockSelect(block: CodeBlockType) {
      this.selectedBlocks = [block]
    },
    handleBlockDragStart(block: CodeBlockType) {
      this.draggedBlock = block
    },
    addBlock(type: string, value: string) {
      const newBlock: CodeBlockType = {
        id: `test-${Date.now()}`,
        type: type as any,
        value
      }
      this.availableBlocks.push(newBlock)
    }
  },
  template: `
    <div class="code-block-system">
      <div class="system-header">
        <h2>Code Block System Test</h2>
        <div class="system-stats">
          <span>Available: {{ availableBlocks.length }}</span>
          <span>Selected: {{ selectedBlocks.length }}</span>
          <span>Dragged: {{ draggedBlock ? draggedBlock.value : 'None' }}</span>
        </div>
      </div>
      
      <div class="system-content">
        <div class="toolbox-section">
          <h3>Toolbox (Grouped)</h3>
          <Toolbox
            :available-blocks="availableBlocks"
            :group-by-category="true"
            :searchable="true"
            @block-select="handleBlockSelect"
            @block-drag-start="handleBlockDragStart"
          />
        </div>
        
        <div class="toolbox-section">
          <h3>Toolbox (Flat)</h3>
          <Toolbox
            :available-blocks="availableBlocks"
            :group-by-category="false"
            @block-select="handleBlockSelect"
            @block-drag-start="handleBlockDragStart"
          />
        </div>
        
        <div class="blocks-section">
          <h3>Individual Blocks</h3>
          <div class="individual-blocks">
            <CodeBlock
              v-for="block in selectedBlocks"
              :key="'selected-' + block.id"
              :type="block.type"
              :value="block.value"
              class="selected-block"
            />
          </div>
        </div>
      </div>
    </div>
  `
})

describe('Code Block System Integration', () => {
  it('should render complete system with toolbox and blocks', () => {
    const wrapper = mount(CodeBlockSystemTest)

    // Should have both toolbox instances
    const toolboxes = wrapper.findAllComponents(Toolbox)
    expect(toolboxes).toHaveLength(2)

    // Should show system stats
    const stats = wrapper.find('.system-stats')
    expect(stats.text()).toContain('Available:')
    expect(stats.text()).toContain('Selected:')
    expect(stats.text()).toContain('Dragged:')
  })

  it('should handle block selection from toolbox', async () => {
    const wrapper = mount(CodeBlockSystemTest)

    // Get first toolbox and select a block
    const firstToolbox = wrapper.findAllComponents(Toolbox)[0]
    const codeBlocks = firstToolbox.findAllComponents(CodeBlock)
    
    expect(codeBlocks.length).toBeGreaterThan(0)
    
    // Click on first block
    await codeBlocks[0].trigger('click')

    // Should update selection in parent component
    const stats = wrapper.find('.system-stats')
    expect(stats.text()).toContain('Selected: 1')
  })

  it('should handle drag operations from toolbox', async () => {
    const wrapper = mount(CodeBlockSystemTest)

    const firstToolbox = wrapper.findAllComponents(Toolbox)[0]
    const codeBlocks = firstToolbox.findAllComponents(CodeBlock)
    
    // Start drag on first block
    await codeBlocks[0].trigger('dragstart')

    // Should update drag state in parent component
    const stats = wrapper.find('.system-stats')
    expect(stats.text()).not.toContain('Dragged: None')
  })

  it('should support different toolbox configurations', () => {
    const wrapper = mount(CodeBlockSystemTest)

    const toolboxes = wrapper.findAllComponents(Toolbox)
    
    // First toolbox should be grouped and searchable
    expect(toolboxes[0].props('groupByCategory')).toBe(true)
    expect(toolboxes[0].props('searchable')).toBe(true)
    
    // Second toolbox should be flat
    expect(toolboxes[1].props('groupByCategory')).toBe(false)
  })

  it('should show selected blocks in individual section', async () => {
    const wrapper = mount(CodeBlockSystemTest)

    // Select a block from toolbox
    const firstToolbox = wrapper.findAllComponents(Toolbox)[0]
    const codeBlocks = firstToolbox.findAllComponents(CodeBlock)
    
    await codeBlocks[0].trigger('click')

    // Should show selected block in individual section
    await wrapper.vm.$nextTick()
    
    const individualBlocks = wrapper.findAll('.selected-block')
    expect(individualBlocks).toHaveLength(1)
  })

  it('should handle dynamic block addition', async () => {
    const wrapper = mount(CodeBlockSystemTest)

    const initialCount = wrapper.vm.availableBlocks.length

    // Add a new block
    wrapper.vm.addBlock('variable', 'newVar')
    await wrapper.vm.$nextTick()

    // Should increase available blocks count
    expect(wrapper.vm.availableBlocks.length).toBe(initialCount + 1)
    
    const stats = wrapper.find('.system-stats')
    expect(stats.text()).toContain(`Available: ${initialCount + 1}`)
  })

  it('should render all predefined block types correctly', () => {
    const wrapper = mount(CodeBlockSystemTest)

    const allBlocks = wrapper.findAllComponents(CodeBlock)
    
    // Should have blocks from both toolboxes (2x the available blocks)
    expect(allBlocks.length).toBeGreaterThan(10)
    
    // Check that different block types are present
    const blockTypes = allBlocks.map(block => block.props('type'))
    const uniqueTypes = [...new Set(blockTypes)]
    
    expect(uniqueTypes.length).toBeGreaterThan(2)
    expect(uniqueTypes).toContain('variable')
    expect(uniqueTypes).toContain('number')
    expect(uniqueTypes).toContain('operator')
    
    // Check if we have enough blocks to include color type
    if (wrapper.vm.availableBlocks.length >= 20) {
      expect(uniqueTypes).toContain('color')
    }
  })
})

describe('Code Block Types Integration', () => {
  it('should render all available block types with correct styling', () => {
    const testBlocks: CodeBlockType[] = [
      { id: 'test-var', type: 'variable', value: 'x' },
      { id: 'test-num', type: 'number', value: '1' },
      { id: 'test-op', type: 'operator', value: '==' },
      { id: 'test-color', type: 'color', value: 'red' },
      { id: 'test-ctrl', type: 'control', value: 'if' }
    ]

    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: testBlocks
      }
    })

    const codeBlocks = wrapper.findAllComponents(CodeBlock)
    expect(codeBlocks).toHaveLength(5)

    // Check type-specific classes
    expect(codeBlocks[0].classes()).toContain('code-block--variable')
    expect(codeBlocks[1].classes()).toContain('code-block--number')
    expect(codeBlocks[2].classes()).toContain('code-block--operator')
    expect(codeBlocks[3].classes()).toContain('code-block--color')
    expect(codeBlocks[4].classes()).toContain('code-block--control')
  })

  it('should handle color blocks with custom styling', () => {
    const colorBlocks: CodeBlockType[] = [
      { id: 'red', type: 'color', value: 'red' },
      { id: 'blue', type: 'color', value: 'blue' },
      { id: 'green', type: 'color', value: 'green' }
    ]

    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: colorBlocks
      }
    })

    const codeBlocks = wrapper.findAllComponents(CodeBlock)
    
    // Check that color blocks have color-specific styling
    expect(codeBlocks[0].attributes('style')).toContain('--block-color: red')
    expect(codeBlocks[1].attributes('style')).toContain('--block-color: blue')
    expect(codeBlocks[2].attributes('style')).toContain('--block-color: green')
  })

  it('should support disabled state across all block types', () => {
    const testBlocks: CodeBlockType[] = [
      { id: 'test-var', type: 'variable', value: 'x' },
      { id: 'test-num', type: 'number', value: '1' }
    ]

    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: testBlocks,
        dragDisabled: true
      }
    })

    const codeBlocks = wrapper.findAllComponents(CodeBlock)
    
    // All blocks should be disabled
    codeBlocks.forEach(block => {
      expect(block.props('disabled')).toBe(true)
    })
  })
})

describe('Toolbox Advanced Features', () => {
  it('should filter blocks by search term across all types', async () => {
    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: AVAILABLE_BLOCKS,
        searchable: true
      }
    })

    const searchInput = wrapper.find('.toolbox__search input')
    
    // Search for 'red'
    await searchInput.setValue('red')
    await wrapper.vm.$nextTick()
    
    const visibleBlocks = wrapper.findAllComponents(CodeBlock)
    expect(visibleBlocks).toHaveLength(1)
    expect(visibleBlocks[0].props('value')).toBe('red')
  })

  it('should group blocks by category correctly', () => {
    const mixedBlocks: CodeBlockType[] = [
      { id: 'var-x', type: 'variable', value: 'x' },
      { id: 'var-y', type: 'variable', value: 'y' },
      { id: 'num-1', type: 'number', value: '1' },
      { id: 'color-red', type: 'color', value: 'red' }
    ]

    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: mixedBlocks,
        groupByCategory: true
      }
    })

    const categories = wrapper.findAll('.toolbox__category')
    expect(categories.length).toBeGreaterThan(1)

    // Should have Variables category with 2 blocks
    const variableCategory = categories.find(cat => 
      cat.find('h4').text() === 'Variables'
    )
    expect(variableCategory).toBeTruthy()
    
    if (variableCategory) {
      const variableBlocks = variableCategory.findAllComponents(CodeBlock)
      expect(variableBlocks).toHaveLength(2)
    }
  })

  it('should support type filtering', () => {
    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: AVAILABLE_BLOCKS.slice(0, 10),
        allowedTypes: ['variable', 'color']
      }
    })

    const codeBlocks = wrapper.findAllComponents(CodeBlock)
    const types = codeBlocks.map(block => block.props('type'))
    
    // Should only have variable and color blocks
    types.forEach(type => {
      expect(['variable', 'color']).toContain(type)
    })
  })

  it('should handle compact mode', () => {
    const wrapper = mount(Toolbox, {
      props: {
        availableBlocks: AVAILABLE_BLOCKS,
        compact: true,
        maxVisibleBlocks: 5
      }
    })

    expect(wrapper.classes()).toContain('toolbox--compact')
    
    const codeBlocks = wrapper.findAllComponents(CodeBlock)
    expect(codeBlocks.length).toBeLessThanOrEqual(5)
  })
})