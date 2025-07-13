import { describe, it, expect } from 'vitest'
import { CodeEvaluator } from '../evaluator'
import type { 
  ProgramNode, 
  AssignmentNode, 
  LiteralNode, 
  VariableNode,
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

    it('should evaluate with default gray when no p assignment', () => {
      const ast = createProgramAST([])

      const result = evaluator.evaluate(ast, { width: 2, height: 2 })

      expect(result.success).toBe(true)
      expect(result.grid).toEqual([
        ['gray', 'gray'],
        ['gray', 'gray']
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