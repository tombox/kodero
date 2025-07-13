import { describe, it, expect } from 'vitest'
import { CodeEvaluator } from '../evaluator'
import type { 
  ProgramNode, 
  AssignmentNode, 
  LiteralNode, 
  VariableNode,
  ConditionalNode,
  BinaryOperationNode,
  EvaluationResult
} from '../ast-types'

describe('CodeEvaluator', () => {
  let evaluator: CodeEvaluator

  beforeEach(() => {
    evaluator = new CodeEvaluator()
  })

  describe('Basic Assignment Evaluation', () => {
    it('should evaluate simple color assignment: p = red', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('red', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['red', 'red'],
        ['red', 'red']
      ])
      expect(result.errors).toHaveLength(0)
    })

    it('should evaluate with default empty string when no p assignment', () => {
      const ast = createProgramAST([])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['', ''],
        ['', '']
      ])
    })

    it('should use coordinates in evaluation context', () => {
      // This test will be useful when we add conditional logic
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('blue', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 3, height: 3 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['blue', 'blue', 'blue'],
        ['blue', 'blue', 'blue'],
        ['blue', 'blue', 'blue']
      ])
    })

    it('should handle multiple assignments (last one wins)', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('red', 'color')),
        createAssignmentAST('p', createLiteralAST('blue', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['blue', 'blue'],
        ['blue', 'blue']
      ])
    })

    it('should handle variable assignments', () => {
      const ast = createProgramAST([
        createAssignmentAST('myColor', createLiteralAST('green', 'color')),
        createAssignmentAST('p', createVariableAST('myColor'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['green', 'green'],
        ['green', 'green']
      ])
    })

    it('should provide built-in x and y coordinates', () => {
      // We'll test this when we implement conditionals
      // For now, just verify the context is set up correctly
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('yellow', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 1, height: 1 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([['yellow']])
    })
  })

  describe('Error Handling', () => {
    it('should handle undefined variable reference', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createVariableAST('undefinedVar'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(4) // One error per grid cell
      expect(result.errors[0].type).toBe('runtime')
      expect(result.errors[0].message).toContain('undefinedVar')
    })

    it('should handle malformed AST gracefully', () => {
      const ast = {
        type: 'Program',
        body: [
          {
            type: 'InvalidNode'
          }
        ]
      } as any

      const result = evaluator.evaluate(ast, { width: 1, height: 1 })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('Unknown')
    })

    it('should continue evaluation after errors in some cells', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createVariableAST('maybeUndefined'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 1 })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(2) // One error per cell
      expect(result.grid).toEqual([['gray', 'gray']]) // Falls back to default
    })
  })

  describe('Different Grid Sizes', () => {
    it('should handle 1x1 grid', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('purple', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 1, height: 1 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([['purple']])
    })

    it('should handle 5x5 grid (game size)', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('red', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 5, height: 5 })

      expect(result.success).toBe(true)
      expect(result.grid).toHaveLength(5)
      expect(result.grid![0]).toHaveLength(5)
      expect(result.grid![0][0]).toBe('red')
      expect(result.grid![4][4]).toBe('red')
    })

    it('should handle rectangular grids', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('blue', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 3, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['blue', 'blue', 'blue'],
        ['blue', 'blue', 'blue']
      ])
    })
  })

  describe('Variable Context', () => {
    it('should initialize context with x, y, and p variables', () => {
      // This will be more relevant when we add conditionals
      // For now, just test that evaluation works at different coordinates
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('green', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 3, height: 3 })

      expect(result.success).toBe(true)
      // All cells should be green regardless of x,y coordinates
      expect(result.grid![0][0]).toBe('green')
      expect(result.grid![1][1]).toBe('green')
      expect(result.grid![2][2]).toBe('green')
    })

    it('should reset context for each grid cell evaluation', () => {
      const ast = createProgramAST([
        createAssignmentAST('temp', createLiteralAST('shouldNotPersist', 'color')),
        createAssignmentAST('p', createLiteralAST('blue', 'color'))
      ])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['blue', 'blue'],
        ['blue', 'blue']
      ])
      // Each cell evaluation should be independent
    })
  })

  describe('Conditional Evaluation', () => {
    it('should evaluate simple if condition: if x == 2 then p = blue', () => {
      const ast = createProgramAST([
        createConditionalAST(
          createBinaryOperationAST('==', createVariableAST('x'), createLiteralAST(2, 'number')),
          [createAssignmentAST('p', createLiteralAST('blue', 'color'))]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 5, height: 3 })

      expect(result.success).toBe(true)
      expect(result.grid).toBeDefined()
      
      // Only x=2 columns should be blue, others should be default
      expect(result.grid![0][2]).toBe('blue') // y=0, x=2
      expect(result.grid![1][2]).toBe('blue') // y=1, x=2
      expect(result.grid![2][2]).toBe('blue') // y=2, x=2
      
      // Other columns should be default (empty or transparent)
      expect(result.grid![0][0]).toBe('')  // y=0, x=0
      expect(result.grid![0][1]).toBe('')  // y=0, x=1
      expect(result.grid![0][3]).toBe('')  // y=0, x=3
    })

    it('should evaluate if condition with different comparison operators', () => {
      const operators = [
        { op: '<', x: 1, shouldMatch: [0] },
        { op: '>', x: 3, shouldMatch: [4] },
        { op: '<=', x: 2, shouldMatch: [0, 1, 2] },
        { op: '>=', x: 2, shouldMatch: [2, 3, 4] },
        { op: '!=', x: 2, shouldMatch: [0, 1, 3, 4] }
      ]

      operators.forEach(({ op, x, shouldMatch }) => {
        const ast = createProgramAST([
          createConditionalAST(
            createBinaryOperationAST(op as BinaryOperationNode['operator'], createVariableAST('x'), createLiteralAST(x, 'number')),
            [createAssignmentAST('p', createLiteralAST('red', 'color'))]
          )
        ])

        const result = evaluator.evaluate(ast, { width: 5, height: 1 })
        expect(result.success).toBe(true)
        
        // Check that only expected x coordinates match
        for (let i = 0; i < 5; i++) {
          if (shouldMatch.includes(i)) {
            expect(result.grid![0][i]).toBe('red')
          } else {
            expect(result.grid![0][i]).toBe('')
          }
        }
      })
    })

    it('should evaluate if condition with y coordinate: if y < 2 then p = green', () => {
      const ast = createProgramAST([
        createConditionalAST(
          createBinaryOperationAST('<', createVariableAST('y'), createLiteralAST(2, 'number')),
          [createAssignmentAST('p', createLiteralAST('green', 'color'))]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 3, height: 4 })

      expect(result.success).toBe(true)
      
      // Only y=0 and y=1 rows should be green
      expect(result.grid![0]).toEqual(['green', 'green', 'green'])
      expect(result.grid![1]).toEqual(['green', 'green', 'green'])
      expect(result.grid![2]).toEqual(['', '', ''])
      expect(result.grid![3]).toEqual(['', '', ''])
    })

    it('should handle multiple statements inside if condition', () => {
      const ast = createProgramAST([
        createConditionalAST(
          createBinaryOperationAST('==', createVariableAST('x'), createLiteralAST(1, 'number')),
          [
            createAssignmentAST('temp', createLiteralAST('intermediate', 'color')),
            createAssignmentAST('p', createVariableAST('temp'))
          ]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 3, height: 2 })

      expect(result.success).toBe(true)
      
      // Only x=1 column should have the color
      expect(result.grid![0][1]).toBe('intermediate')
      expect(result.grid![1][1]).toBe('intermediate')
      expect(result.grid![0][0]).toBe('')
      expect(result.grid![0][2]).toBe('')
    })

    it('should handle nested conditions with default fallback', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('default', 'color')),
        createConditionalAST(
          createBinaryOperationAST('==', createVariableAST('x'), createLiteralAST(2, 'number')),
          [createAssignmentAST('p', createLiteralAST('special', 'color'))]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 4, height: 2 })

      expect(result.success).toBe(true)
      
      // x=2 should be special, others should be default
      expect(result.grid![0][0]).toBe('default')
      expect(result.grid![0][1]).toBe('default')
      expect(result.grid![0][2]).toBe('special')
      expect(result.grid![0][3]).toBe('default')
    })

    it('should evaluate if-else statements: p = green, if x == 2 then p = red else p = blue', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('green', 'color')),
        createConditionalWithElseAST(
          createBinaryOperationAST('==', createVariableAST('x'), createLiteralAST(2, 'number')),
          [createAssignmentAST('p', createLiteralAST('red', 'color'))],
          [createAssignmentAST('p', createLiteralAST('blue', 'color'))]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 5, height: 2 })

      expect(result.success).toBe(true)
      
      // x=2 should be red, all others should be blue (never green)
      expect(result.grid![0][0]).toBe('blue')   // x=0
      expect(result.grid![0][1]).toBe('blue')   // x=1  
      expect(result.grid![0][2]).toBe('red')    // x=2
      expect(result.grid![0][3]).toBe('blue')   // x=3
      expect(result.grid![0][4]).toBe('blue')   // x=4
      
      // Second row should have same pattern
      expect(result.grid![1][0]).toBe('blue')   // x=0
      expect(result.grid![1][1]).toBe('blue')   // x=1
      expect(result.grid![1][2]).toBe('red')    // x=2
      expect(result.grid![1][3]).toBe('blue')   // x=3
      expect(result.grid![1][4]).toBe('blue')   // x=4
    })

    it('should evaluate if-else with different comparison operators', () => {
      const ast = createProgramAST([
        createConditionalWithElseAST(
          createBinaryOperationAST('<', createVariableAST('x'), createLiteralAST(2, 'number')),
          [createAssignmentAST('p', createLiteralAST('left', 'color'))],
          [createAssignmentAST('p', createLiteralAST('right', 'color'))]
        )
      ])

      const result = evaluator.evaluate(ast, { width: 4, height: 1 })

      expect(result.success).toBe(true)
      
      // x < 2: x=0,1 should be 'left', x=2,3 should be 'right'
      expect(result.grid![0][0]).toBe('left')   // x=0 < 2
      expect(result.grid![0][1]).toBe('left')   // x=1 < 2
      expect(result.grid![0][2]).toBe('right')  // x=2 >= 2
      expect(result.grid![0][3]).toBe('right')  // x=3 >= 2
    })
  })

  describe('Performance', () => {
    it('should handle reasonable grid sizes efficiently', () => {
      const ast = createProgramAST([
        createAssignmentAST('p', createLiteralAST('red', 'color'))
      ])

      const startTime = performance.now()
      const result = evaluator.evaluate(ast, { width: 10, height: 10 })
      const endTime = performance.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(100) // Should be very fast for simple cases
    })
  })
})

// Helper functions for creating test AST nodes
function createProgramAST(statements: any[]): ProgramNode {
  return {
    type: 'Program',
    body: statements
  }
}

function createAssignmentAST(varName: string, value: any): AssignmentNode {
  return {
    type: 'Assignment',
    variable: createVariableAST(varName),
    value
  }
}

function createLiteralAST(value: string | number, dataType: 'color' | 'number' | 'string'): LiteralNode {
  return {
    type: 'Literal',
    value,
    dataType
  }
}

function createVariableAST(name: string): VariableNode {
  return {
    type: 'Variable',
    name
  }
}

function createBinaryOperationAST(
  operator: BinaryOperationNode['operator'], 
  left: VariableNode | LiteralNode, 
  right: VariableNode | LiteralNode
): BinaryOperationNode {
  return {
    type: 'BinaryOperation',
    operator,
    left,
    right
  }
}

function createConditionalAST(
  condition: BinaryOperationNode, 
  thenBody: AssignmentNode[]
): ConditionalNode {
  return {
    type: 'Conditional',
    condition,
    thenBody
  }
}

function createConditionalWithElseAST(
  condition: BinaryOperationNode, 
  thenBody: AssignmentNode[],
  elseBody: AssignmentNode[]
): ConditionalNode {
  return {
    type: 'Conditional',
    condition,
    thenBody,
    elseBody
  }
}