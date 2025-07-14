/**
 * Code Evaluator - Executes AST to generate color grids
 * 
 * Takes a parsed AST and evaluates it for each grid coordinate (x,y)
 * to produce a color matrix for the game canvas.
 */

import type { 
  ProgramNode, 
  AssignmentNode, 
  VariableNode, 
  ASTNode,
  ConditionalNode,
  BinaryOperationNode,
  ExecutionContext,
  EvaluationResult
} from './ast-types'

import {
  isAssignmentNode,
  isLiteralNode,
  isVariableNode,
  isConditionalNode,
  isBinaryOperationNode
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
          const pixelColor = context.variables.get('p') || ''
          grid[y][x] = pixelColor
        } catch (error) {
          // Record error but continue evaluation
          errors.push({
            x,
            y,
            message: error instanceof Error ? error.message : 'Unknown runtime error',
            type: 'runtime'
          })
          // Use empty string for error cells (shows as light gray)
          grid[y][x] = ''
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
    variables.set('p', '') // Default pixel color (empty for transparent)

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
    } else if (isConditionalNode(statement)) {
      this.executeConditional(statement, context)
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
   * Execute a conditional statement
   */
  private executeConditional(conditional: ConditionalNode, context: ExecutionContext): void {
    const conditionResult = this.evaluateCondition(conditional.condition, context)
    
    if (conditionResult) {
      // Execute the then body if condition is true
      this.executeStatements(conditional.thenBody, context)
    } else if (conditional.elseBody) {
      // Execute the else body if condition is false and else body exists
      this.executeStatements(conditional.elseBody, context)
    }
  }

  /**
   * Evaluate a condition (binary operation or variable) to get a boolean result
   */
  private evaluateCondition(condition: BinaryOperationNode | VariableNode, context: ExecutionContext): boolean {
    if (isBinaryOperationNode(condition)) {
      return this.evaluateBinaryOperation(condition, context)
    }
    
    if (isVariableNode(condition)) {
      const value = this.evaluateExpression(condition, context)
      // Convert to boolean (truthy values)
      return Boolean(value)
    }
    
    throw new Error(`Unknown condition type: ${(condition as any).type}`)
  }

  /**
   * Evaluate a binary operation and return the result
   */
  private evaluateBinaryOperation(operation: BinaryOperationNode, context: ExecutionContext): any {
    const leftValue = this.evaluateExpression(operation.left, context)
    const rightValue = this.evaluateExpression(operation.right, context)
    
    switch (operation.operator) {
      case '==':
        return leftValue === rightValue
      case '!=':
        return leftValue !== rightValue
      case '<':
        return leftValue < rightValue
      case '>':
        return leftValue > rightValue
      case '<=':
        return leftValue <= rightValue
      case '>=':
        return leftValue >= rightValue
      case '+':
        return leftValue + rightValue
      case '-':
        return leftValue - rightValue
      case '*':
        return leftValue * rightValue
      case '/':
        return leftValue / rightValue
      case '%':
        return leftValue % rightValue
      default:
        throw new Error(`Unknown binary operator: ${operation.operator}`)
    }
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
    
    if (isBinaryOperationNode(expression)) {
      return this.evaluateBinaryOperation(expression, context)
    }

    throw new Error(`Unknown expression type: ${expression.type}`)
  }
}