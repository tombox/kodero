import { describe, it, expect } from 'vitest'
import { CodeParser } from '../parser'
import type { CodeStructure, CodeLine } from '../../types/codeStructures'
import type { CodeBlock } from '../../types/codeBlocks'
import type { 
  ProgramNode, 
  AssignmentNode, 
  LiteralNode, 
  VariableNode,
  ConditionalNode,
  BinaryOperationNode,
  ParseResult
} from '../ast-types'

describe('CodeParser', () => {
  let parser: CodeParser

  beforeEach(() => {
    parser = new CodeParser()
  })

  describe('Basic Assignment Parsing', () => {
    it('should parse simple color assignment: p = red', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      expect(result.ast).toBeDefined()
      expect(result.ast!.type).toBe('Program')
      expect(result.ast!.body).toHaveLength(1)

      const assignment = result.ast!.body[0] as AssignmentNode
      expect(assignment.type).toBe('Assignment')
      expect(assignment.variable.name).toBe('p')
      expect((assignment.value as LiteralNode).value).toBe('red')
      expect((assignment.value as LiteralNode).dataType).toBe('color')
    })

    it('should parse number assignment: x = 2', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '=' },
          { type: 'number', value: '2' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const assignment = result.ast!.body[0] as AssignmentNode
      expect(assignment.variable.name).toBe('x')
      expect((assignment.value as LiteralNode).value).toBe(2)
      expect((assignment.value as LiteralNode).dataType).toBe('number')
    })

    it('should parse variable to variable assignment: p = x', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'variable', value: 'x' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const assignment = result.ast!.body[0] as AssignmentNode
      expect(assignment.variable.name).toBe('p')
      expect((assignment.value as VariableNode).name).toBe('x')
    })

    it('should parse multiple assignments', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 0),
        createTestLine([
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '=' },
          { type: 'number', value: '3' }
        ], 1)
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      expect(result.ast!.body).toHaveLength(2)

      const firstAssignment = result.ast!.body[0] as AssignmentNode
      expect(firstAssignment.variable.name).toBe('p')
      expect((firstAssignment.value as LiteralNode).value).toBe('red')

      const secondAssignment = result.ast!.body[1] as AssignmentNode
      expect(secondAssignment.variable.name).toBe('x')
      expect((secondAssignment.value as LiteralNode).value).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle empty structure', () => {
      const structure = createTestStructure([])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      expect(result.ast!.body).toHaveLength(0)
    })

    it('should handle lines with no blocks', () => {
      const structure = createTestStructure([
        createTestLine([])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      expect(result.ast!.body).toHaveLength(0)
    })

    it('should handle malformed assignment (missing operator)', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'color', value: 'red' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('syntax')
      expect(result.errors[0].message).toContain('assignment')
    })

    it('should handle malformed assignment (missing value)', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('syntax')
      expect(result.errors[0].message).toContain('value')
    })

    it('should handle invalid assignment target (number = red)', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'number', value: '2' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].type).toBe('semantic')
      expect(result.errors[0].message).toContain('variable')
    })
  })

  describe('Type Conversion', () => {
    it('should convert string numbers to actual numbers', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '=' },
          { type: 'number', value: '42' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const assignment = result.ast!.body[0] as AssignmentNode
      expect((assignment.value as LiteralNode).value).toBe(42)
      expect(typeof (assignment.value as LiteralNode).value).toBe('number')
    })

    it('should preserve color values as strings', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const assignment = result.ast!.body[0] as AssignmentNode
      expect((assignment.value as LiteralNode).value).toBe('blue')
      expect(typeof (assignment.value as LiteralNode).value).toBe('string')
    })
  })

  describe('Conditional Parsing', () => {
    it('should parse simple if condition: if x == 2', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'control', value: 'if' },
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '==' },
          { type: 'number', value: '2' }
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      expect(result.ast!.body).toHaveLength(1)

      const conditional = result.ast!.body[0] as ConditionalNode
      expect(conditional.type).toBe('Conditional')
      
      const condition = conditional.condition as BinaryOperationNode
      expect(condition.type).toBe('BinaryOperation')
      expect(condition.operator).toBe('==')
      expect((condition.left as VariableNode).name).toBe('x')
      expect((condition.right as LiteralNode).value).toBe(2)
    })

    it('should parse if condition with comparison operators', () => {
      const operators = ['==', '!=', '<', '>', '<=', '>=']
      
      operators.forEach(op => {
        const structure = createTestStructure([
          createTestLine([
            { type: 'control', value: 'if' },
            { type: 'variable', value: 'y' },
            { type: 'operator', value: op },
            { type: 'number', value: '4' }
          ])
        ])

        const result = parser.parse(structure)
        expect(result.success).toBe(true)
        
        const conditional = result.ast!.body[0] as ConditionalNode
        const condition = conditional.condition as BinaryOperationNode
        expect(condition.operator).toBe(op)
      })
    })

    it('should parse if condition with child statements', () => {
      const structure = createTestStructure([
        // if x == 2
        createTestLine([
          { type: 'control', value: 'if' },
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '==' },
          { type: 'number', value: '2' }
        ], 0, 0), // indent level 0
        // indented: p = blue
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ], 1, 1, 'line-0') // indent level 1, parent line 0
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const conditional = result.ast!.body[0] as ConditionalNode
      expect(conditional.thenBody).toHaveLength(1)
      
      const thenStatement = conditional.thenBody[0] as AssignmentNode
      expect(thenStatement.variable.name).toBe('p')
      expect((thenStatement.value as LiteralNode).value).toBe('blue')
    })

    it('should parse if-else statements with child blocks', () => {
      const structure = createTestStructure([
        // if x == 2
        createTestLine([
          { type: 'control', value: 'if' },
          { type: 'variable', value: 'x' },
          { type: 'operator', value: '==' },
          { type: 'number', value: '2' }
        ], 0, 0), // indent level 0, no parent (top level)
        // indented: p = red
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 1, 1, 'line-0'), // indent level 1, parent line 0
        // else (same level as if)
        createTestLine([
          { type: 'control', value: 'else' }
        ], 2, 0), // indent level 0, no parent (same level as if)
        // indented: p = blue
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ], 3, 1, 'line-2') // indent level 1, parent line 2 (else line)
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const conditional = result.ast!.body[0] as ConditionalNode
      expect(conditional.type).toBe('Conditional')
      expect(conditional.thenBody).toHaveLength(1)
      expect(conditional.elseBody).toHaveLength(1)
      
      const thenStatement = conditional.thenBody[0] as AssignmentNode
      expect(thenStatement.variable.name).toBe('p')
      expect((thenStatement.value as LiteralNode).value).toBe('red')
      
      const elseStatement = conditional.elseBody[0] as AssignmentNode
      expect(elseStatement.variable.name).toBe('p')
      expect((elseStatement.value as LiteralNode).value).toBe('blue')
    })

    it('should handle malformed if conditions', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'control', value: 'if' },
          { type: 'variable', value: 'x' }
          // Missing operator and value
        ])
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('condition')
    })
  })

  describe('Line Location Tracking', () => {
    it('should track line numbers for error reporting', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 0),
        createTestLine([
          { type: 'number', value: '2' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'blue' }
        ], 1)
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].line).toBe(2) // Second line (0-indexed becomes 1-based)
    })

    it('should add location info to AST nodes', () => {
      const structure = createTestStructure([
        createTestLine([
          { type: 'variable', value: 'p' },
          { type: 'operator', value: '=' },
          { type: 'color', value: 'red' }
        ], 0)
      ])

      const result = parser.parse(structure)

      expect(result.success).toBe(true)
      const assignment = result.ast!.body[0] as AssignmentNode
      expect(assignment.location?.line).toBe(0)
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

function createTestLine(blocks: Partial<CodeBlock>[], lineIndex = 0, indentLevel = 0, parentLineId?: string): CodeLine {
  const fullBlocks = blocks.map((block, index) => ({
    id: `block-${lineIndex}-${index}`,
    type: block.type as any,
    value: block.value as any,
    ...block
  }))

  return {
    id: `line-${lineIndex}`,
    type: 'expression',
    indentLevel,
    parentLineId,
    slots: fullBlocks.map((_, index) => ({
      id: `slot-${index}`,
      placeholder: 'drop here'
    })),
    placedBlocks: fullBlocks,
    minSlots: 1,
    maxSlots: 10
  }
}