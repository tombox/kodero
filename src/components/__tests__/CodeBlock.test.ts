import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CodeBlock from '../CodeBlock.vue'

describe('CodeBlock', () => {
  describe('Basic Rendering', () => {
    it('should render correctly with required props', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('code-block')
      expect(wrapper.text()).toBe('x')
    })

    it('should apply type-specific CSS classes', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'y'
        }
      })
      
      expect(wrapper.classes()).toContain('code-block')
      expect(wrapper.classes()).toContain('code-block--variable')
    })

    it('should display the value as text content', () => {
      const testCases = [
        { type: 'number', value: '5', expected: '5' },
        { type: 'operator', value: '==', expected: '==' },
        { type: 'color', value: 'red', expected: 'red' },
        { type: 'control', value: 'if', expected: 'if' }
      ]

      testCases.forEach(({ type, value, expected }) => {
        const wrapper = mount(CodeBlock, {
          props: { type, value }
        })
        expect(wrapper.text()).toBe(expected)
      })
    })
  })

  describe('Block Types', () => {
    it('should handle variable blocks', () => {
      const variables = ['x', 'y', 'p']
      
      variables.forEach(variable => {
        const wrapper = mount(CodeBlock, {
          props: {
            type: 'variable',
            value: variable
          }
        })
        
        expect(wrapper.classes()).toContain('code-block--variable')
        expect(wrapper.text()).toBe(variable)
      })
    })

    it('should handle number blocks', () => {
      const numbers = ['0', '1', '2', '3', '4']
      
      numbers.forEach(number => {
        const wrapper = mount(CodeBlock, {
          props: {
            type: 'number',
            value: number
          }
        })
        
        expect(wrapper.classes()).toContain('code-block--number')
        expect(wrapper.text()).toBe(number)
      })
    })

    it('should handle operator blocks', () => {
      const operators = ['=', '==', '!=', '<', '>', '<=', '>=']
      
      operators.forEach(operator => {
        const wrapper = mount(CodeBlock, {
          props: {
            type: 'operator',
            value: operator
          }
        })
        
        expect(wrapper.classes()).toContain('code-block--operator')
        expect(wrapper.text()).toBe(operator)
      })
    })

    it('should handle color blocks', () => {
      const colors = ['red', 'blue', 'green', 'yellow', 'purple']
      
      colors.forEach(color => {
        const wrapper = mount(CodeBlock, {
          props: {
            type: 'color',
            value: color
          }
        })
        
        expect(wrapper.classes()).toContain('code-block--color')
        expect(wrapper.text()).toBe(color)
      })
    })

    it('should handle control flow blocks', () => {
      const controlBlocks = ['if', 'else']
      
      controlBlocks.forEach(control => {
        const wrapper = mount(CodeBlock, {
          props: {
            type: 'control',
            value: control
          }
        })
        
        expect(wrapper.classes()).toContain('code-block--control')
        expect(wrapper.text()).toBe(control)
      })
    })
  })

  describe('Visual Styling', () => {
    it('should apply color-specific background for color blocks', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'color',
          value: 'red'
        }
      })
      
      expect(wrapper.attributes('style')).toContain('--block-color: red')
    })

    it('should not apply color styling for non-color blocks', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      const style = wrapper.attributes('style')
      expect(style || '').not.toContain('--block-color')
    })

    it('should be draggable by default', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      expect(wrapper.attributes('draggable')).toBe('true')
    })

    it('should support disabled state', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x',
          disabled: true
        }
      })
      
      expect(wrapper.classes()).toContain('code-block--disabled')
      expect(wrapper.attributes('draggable')).toBe('false')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      expect(wrapper.attributes('role')).toBe('button')
      expect(wrapper.attributes('aria-label')).toBe('Code block: variable x')
      expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('should handle keyboard interactions', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      // Should be focusable
      expect(wrapper.attributes('tabindex')).toBe('0')
      
      // Should handle Enter key
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('select')).toBeTruthy()
      
      // Should handle Space key  
      await wrapper.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('select')).toHaveLength(2)
    })

    it('should be accessible when disabled', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x',
          disabled: true
        }
      })
      
      expect(wrapper.attributes('aria-disabled')).toBe('true')
      expect(wrapper.attributes('tabindex')).toBe('-1')
    })
  })

  describe('Events', () => {
    it('should emit click events', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('should emit select events on keyboard activation', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      await wrapper.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([{
        type: 'variable',
        value: 'x'
      }])
    })

    it('should not emit events when disabled', async () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x',
          disabled: true
        }
      })
      
      await wrapper.trigger('click')
      await wrapper.trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('click')).toBeFalsy()
      expect(wrapper.emitted('select')).toBeFalsy()
    })
  })

  describe('TypeScript Props Validation', () => {
    it('should accept valid block types', () => {
      const validTypes = ['variable', 'number', 'operator', 'color', 'control']
      
      validTypes.forEach(type => {
        expect(() => {
          mount(CodeBlock, {
            props: {
              type: type as any,
              value: 'test'
            }
          })
        }).not.toThrow()
      })
    })

    it('should work with all required props', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          type: 'variable',
          value: 'x'
        }
      })
      
      expect(wrapper.props('type')).toBe('variable')
      expect(wrapper.props('value')).toBe('x')
      expect(wrapper.props('disabled')).toBe(false)
    })
  })
})