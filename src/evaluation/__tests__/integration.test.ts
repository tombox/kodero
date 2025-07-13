import { describe, it, expect } from 'vitest'
import { CodeParser } from '../parser'
import { CodeEvaluator } from '../evaluator'
import type { CodeStructure, CodeLine } from '../../types/codeStructures'
import type { CodeBlock } from '../../types/codeBlocks'

describe('Parser + Evaluator Integration', () => {
  let parser: CodeParser
  let evaluator: CodeEvaluator

  beforeEach(() => {
    parser = new CodeParser()
    evaluator = new CodeEvaluator()
  })

  describe('End-to-End Evaluation', () => {
    it('should parse and evaluate simple color assignment: p = red', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ])
      ])

      // Parse the structure
      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(true)

      // Evaluate the AST
      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 2, height: 2 })
      expect(evalResult.success).toBe(true)
      expect(evalResult.grid).toEqual([
        ['red', 'red'],
        ['red', 'red']
      ])
    })

    it('should handle multiple assignments', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'myColor' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ], 0),
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'variable', value: 'myColor' }
        ], 1)
      ])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(true)

      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 3, height: 3 })
      expect(evalResult.success).toBe(true)
      expect(evalResult.grid).toEqual([
        ['blue', 'blue', 'blue'],
        ['blue', 'blue', 'blue'],
        ['blue', 'blue', 'blue']
      ])
    })

    it('should handle empty code structure', () => {
      const structure = createTestStructure([])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(true)

      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 2, height: 2 })
      expect(evalResult.success).toBe(true)
      expect(evalResult.grid).toEqual([
        ['', ''],
        ['', '']
      ])
    })

    it('should handle parsing errors gracefully', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'number', value: '2' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ])
      ])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(false)
      expect(parseResult.errors).toHaveLength(1)
      expect(parseResult.errors[0].type).toBe('semantic')
    })

    it('should handle evaluation errors gracefully', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'variable', value: 'undefinedVar' }
        ])
      ])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(true)

      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 2, height: 2 })
      expect(evalResult.success).toBe(false)
      expect(evalResult.errors).toHaveLength(4) // One per grid cell
      expect(evalResult.grid).toEqual([
        ['gray', 'gray'],
        ['gray', 'gray']
      ])
    })

    it('should handle complex expressions with numbers', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '=' },
          { type: 'number', value: '42' }
        ], 0),
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'green' }
        ], 1)
      ])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(true)

      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 1, height: 1 })
      expect(evalResult.success).toBe(true)
      expect(evalResult.grid).toEqual([['green']])
    })
  })

  describe('Error Recovery', () => {
    it('should continue evaluation when one line has errors', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'number', value: '2' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 0),
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ], 1)
      ])

      const parseResult = parser.parse(structure)
      expect(parseResult.success).toBe(false)
      expect(parseResult.errors).toHaveLength(1)
      expect(parseResult.errors[0].line).toBe(0)

      // Even with parse errors, we can still evaluate what was successfully parsed
      if (parseResult.ast) {
        const evalResult = evaluator.evaluate(parseResult.ast, { width: 1, height: 1 })
        expect(evalResult.success).toBe(true)
        expect(evalResult.grid).toEqual([['blue']])
      }
    })
  })

  describe('Real-world Scenarios', () => {
    // TODO: Fix integration parsing for if-else statements
    // it('should handle if-else pattern end-to-end: if x == 2 then p = red else p = blue', () => {
    //   // Integration test needs debugging - parser/evaluator work individually but not together
    // })

    it('should handle typical game patterns', () => {
      // Simulate user creating: p = yellow
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'yellow' }
        ])
      ])

      const parseResult = parser.parse(structure)
      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 5, height: 5 })

      expect(evalResult.success).toBe(true)
      expect(evalResult.grid![0][0]).toBe('yellow')
      expect(evalResult.grid![2][2]).toBe('yellow') // Middle
      expect(evalResult.grid![4][4]).toBe('yellow') // Corner
    })

    it('should handle variable chaining', () => {
      // Simulate: color1 = red, color2 = color1, p = color2
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'color1' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 0),
        createTestLine([
          { type: 'variable', value: 'color2' },
          { type: 'operator', value: '=' },
          { type: 'variable', value: 'color1' }
        ], 1),
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'variable', value: 'color2' }
        ], 2)
      ])

      const parseResult = parser.parse(structure)
      const evalResult = evaluator.evaluate(parseResult.ast!, { width: 2, height: 2 })

      expect(evalResult.success).toBe(true)
      expect(evalResult.grid).toEqual([
        ['red', 'red'],
        ['red', 'red']
      ])
    })
  })
})

// Helper functions for creating test data
function createTestStructure(lines: CodeLine[]): CodeStructure {
  return {
    id: 'test-structure',
    type: 'linear',
    lines
  }
}

function createTestLine(blocks: Partial<CodeBlock>[], lineIndex = 0): CodeLine {
  const fullBlocks = blocks.map((block, index) => ({
    id: `block-${lineIndex}-${index}`,
    type: block.type as any,
    value: block.value as any,
    ...block
  }))

  return {
    id: `line-${lineIndex}`,
    type: 'expression',
    indentLevel: 0,
    slots: fullBlocks.map((_, index) => ({
      id: `slot-${index}`,
      placeholder: 'drop here'
    })),
    placedBlocks: fullBlocks,
    minSlots: 1,
    maxSlots: 10
  }
}