/**
 * Code Evaluator - Executes AST to generate color grids
 * 
 * Takes a parsed AST and evaluates it for each grid coordinate (x,y)
 * to produce a color matrix for the game canvas.
 */

import type { 
  ProgramNode, 
  AssignmentNode, 
  LiteralNode, 
  VariableNode, 
  ASTNode,
  ExecutionContext,
  EvaluationResult
} from './ast-types'

import {
  isAssignmentNode,
  isLiteralNode,
  isVariableNode
} from './ast-types'

export class CodeEvaluator {
  /**
   * Evaluate an AST program for all grid coordinates and return a color matrix
   */
  evaluate(ast: ProgramNode, gridSize: { width: number; height: number }): EvaluationResult {
    const grid: string[][] = []
    const errors: EvaluationResult['errors'] = []

    // Evaluate for each grid coordinate
    for (let y = 0; y < gridSize.height; y++) {
      grid[y] = []
      for (let x = 0; x < gridSize.width; x++) {
        try {
          const context = this.createExecutionContext(x, y)
          this.executeStatements(ast.body, context)
          
          // Get the final value of 'p' (pixel color)
          const pixelColor = context.variables.get('p') || 'gray'
          grid[y][x] = pixelColor
        } catch (error) {
          // Record error but continue evaluation
          errors.push({
            x,
            y,
            message: error instanceof Error ? error.message : 'Unknown runtime error',
            type: 'runtime'
          })
          // Use default color for error cells
          grid[y][x] = 'gray'
        }
      }
    }

    return {
      success: errors.length === 0,
      grid,
      errors
    }
  }

  /**
   * Create an execution context for a specific grid coordinate
   */
  private createExecutionContext(x: number, y: number): ExecutionContext {
    const variables = new Map<string, any>()
    
    // Initialize built-in variables
    variables.set('x', x)
    variables.set('y', y)
    variables.set('p', 'gray') // Default pixel color

    return {
      variables,
      coordinates: { x, y },
      errors: []
    }
  }

  /**
   * Execute a list of statements in the given context
   */
  private executeStatements(statements: ASTNode[], context: ExecutionContext): void {
    for (const statement of statements) {
      this.executeStatement(statement, context)
    }
  }

  /**
   * Execute a single statement
   */
  private executeStatement(statement: ASTNode, context: ExecutionContext): void {
    if (isAssignmentNode(statement)) {
      this.executeAssignment(statement, context)
    } else {
      throw new Error(`Unknown statement type: ${statement.type}`)
    }
  }

  /**
   * Execute an assignment statement
   */
  private executeAssignment(assignment: AssignmentNode, context: ExecutionContext): void {
    const variableName = assignment.variable.name
    const value = this.evaluateExpression(assignment.value, context)
    
    // Store the value in the context
    context.variables.set(variableName, value)
  }

  /**
   * Evaluate an expression to get its value
   */
  private evaluateExpression(expression: ASTNode, context: ExecutionContext): any {
    if (isLiteralNode(expression)) {
      return expression.value
    }
    
    if (isVariableNode(expression)) {
      const value = context.variables.get(expression.name)
      if (value === undefined) {
        throw new Error(`Undefined variable: ${expression.name}`)
      }
      return value
    }

    throw new Error(`Unknown expression type: ${expression.type}`)
  }
}