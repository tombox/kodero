/**
 * Abstract Syntax Tree (AST) type definitions for code evaluation
 * 
 * Starting with simple assignments and gradually expanding to support
 * conditionals, expressions, and more complex language features.
 */

// Base interface for all AST nodes
export interface ASTNode {
  type: string
  location?: {
    line: number
    column?: number
  }
}

// Literal values (numbers, colors, strings)
export interface LiteralNode extends ASTNode {
  type: 'Literal'
  value: string | number
  dataType: 'number' | 'color' | 'string'
}

// Variable references (x, y, p, etc.)
export interface VariableNode extends ASTNode {
  type: 'Variable'
  name: string // 'x', 'y', 'p', custom variables
}

// Assignment statements (p = red, x = 2)
export interface AssignmentNode extends ASTNode {
  type: 'Assignment'
  variable: VariableNode
  value: LiteralNode | VariableNode | BinaryOperationNode
}

// Binary operations (+, -, *, /, ==, !=, <, >, etc.)
export interface BinaryOperationNode extends ASTNode {
  type: 'BinaryOperation'
  operator: '=' | '==' | '!=' | '<' | '>' | '<=' | '>=' | '+' | '-' | '*' | '/' | '%'
  left: ASTNode
  right: ASTNode
}

// Conditional statements (if/else)
export interface ConditionalNode extends ASTNode {
  type: 'Conditional'
  condition: BinaryOperationNode | VariableNode
  thenBody: ASTNode[]
  elseBody?: ASTNode[]
}

// Top-level program containing all statements
export interface ProgramNode extends ASTNode {
  type: 'Program'
  body: ASTNode[]
}

// Union type for all possible AST nodes
export type ASTNodeType = 
  | LiteralNode 
  | VariableNode 
  | AssignmentNode 
  | BinaryOperationNode 
  | ConditionalNode 
  | ProgramNode

// Helper type guards for runtime type checking
export function isLiteralNode(node: ASTNode): node is LiteralNode {
  return node.type === 'Literal'
}

export function isVariableNode(node: ASTNode): node is VariableNode {
  return node.type === 'Variable'
}

export function isAssignmentNode(node: ASTNode): node is AssignmentNode {
  return node.type === 'Assignment'
}

export function isBinaryOperationNode(node: ASTNode): node is BinaryOperationNode {
  return node.type === 'BinaryOperation'
}

export function isConditionalNode(node: ASTNode): node is ConditionalNode {
  return node.type === 'Conditional'
}

export function isProgramNode(node: ASTNode): node is ProgramNode {
  return node.type === 'Program'
}

// Execution context for evaluating code at specific grid coordinates
export interface ExecutionContext {
  variables: Map<string, any>
  coordinates: { x: number; y: number }
  errors: string[]
}

// Result of parsing operation
export interface ParseResult {
  success: boolean
  ast?: ProgramNode
  errors: Array<{
    line: number
    message: string
    type: 'syntax' | 'semantic'
  }>
}

// Result of evaluation operation
export interface EvaluationResult {
  success: boolean
  grid?: string[][]
  errors: Array<{
    x: number
    y: number
    message: string
    type: 'runtime'
  }>
}