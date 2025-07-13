/**
 * Code Parser - Converts CodeStructure from the visual editor into an AST
 * 
 * Implements a simple parser that recognizes basic assignment patterns
 * and converts them into executable AST nodes.
 */

import type { CodeStructure, CodeLine } from '../types/codeStructures'
import type { CodeBlock } from '../types/codeBlocks'
import type { 
  ParseResult, 
  ProgramNode, 
  AssignmentNode, 
  LiteralNode, 
  VariableNode, 
  ASTNode 
} from './ast-types'

export class CodeParser {
  /**
   * Parse a code structure from the visual editor into an AST
   */
  parse(structure: CodeStructure): ParseResult {
    const errors: ParseResult['errors'] = []
    const statements: ASTNode[] = []

    // Process each line in the structure
    for (let i = 0; i < structure.lines.length; i++) {
      const line = structure.lines[i]
      
      try {
        const statement = this.parseLine(line, i)
        if (statement) {
          statements.push(statement)
        }
      } catch (error) {
        const errorType = (error as any).errorType || 'syntax'
        errors.push({
          line: i,
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          type: errorType
        })
      }
    }

    const success = errors.length === 0
    const ast: ProgramNode = {
      type: 'Program',
      body: statements
    }

    return {
      success,
      ast: success ? ast : undefined,
      errors
    }
  }

  /**
   * Parse a single line into an AST node
   */
  private parseLine(line: CodeLine, lineIndex: number): ASTNode | null {
    // Get all non-null blocks from the line
    const blocks = line.placedBlocks.filter((block): block is CodeBlock => block !== null)
    
    // Skip empty lines
    if (blocks.length === 0) {
      return null
    }

    // Try to parse as assignment first
    if (this.looksLikeAssignment(blocks)) {
      return this.parseAssignment(blocks, lineIndex)
    }

    // If we can't recognize the pattern, it's an error
    throw new Error(`Unrecognized code pattern at line ${lineIndex + 1}`)
  }

  /**
   * Check if blocks look like they're trying to be an assignment
   * (more lenient than isAssignmentPattern for better error messages)
   */
  private looksLikeAssignment(blocks: CodeBlock[]): boolean {
    // If it starts with a variable or has an = operator, treat as assignment attempt
    return (
      blocks.length >= 1 && 
      (blocks[0].type === 'variable' || 
       blocks.some(block => block.type === 'operator' && block.value === '='))
    )
  }

  /**
   * Check if blocks represent an assignment pattern: variable = value
   */
  private isAssignmentPattern(blocks: CodeBlock[]): boolean {
    return (
      blocks.length === 3 &&
      blocks[0].type === 'variable' &&
      blocks[1].type === 'operator' &&
      blocks[1].value === '=' &&
      (blocks[2].type === 'variable' || 
       blocks[2].type === 'color' || 
       blocks[2].type === 'number')
    )
  }

  /**
   * Parse an assignment pattern into an AssignmentNode
   */
  private parseAssignment(blocks: CodeBlock[], lineIndex: number): AssignmentNode {
    // Check for semantic errors first (wrong target type)
    if (blocks[0].type !== 'variable') {
      const error = new Error(`Invalid assignment target: expected variable, got ${blocks[0].type}`)
      // Mark as semantic error and rethrow with custom type
      const semanticError = new Error(error.message) as any
      semanticError.errorType = 'semantic'
      throw semanticError
    }

    // Check for missing operator
    if (blocks.length < 2 || blocks[1].type !== 'operator' || blocks[1].value !== '=') {
      throw new Error('Invalid assignment: expected = operator')
    }

    // Check for missing value
    if (blocks.length < 3) {
      throw new Error('Invalid assignment: missing value')
    }

    const variable: VariableNode = {
      type: 'Variable',
      name: blocks[0].value,
      location: { line: lineIndex }
    }

    const value = this.parseValue(blocks[2], lineIndex)

    return {
      type: 'Assignment',
      variable,
      value,
      location: { line: lineIndex }
    }
  }

  /**
   * Parse a value (literal or variable reference)
   */
  private parseValue(block: CodeBlock, lineIndex: number): LiteralNode | VariableNode {
    switch (block.type) {
      case 'variable':
        return {
          type: 'Variable',
          name: block.value,
          location: { line: lineIndex }
        }

      case 'color':
        return {
          type: 'Literal',
          value: block.value,
          dataType: 'color',
          location: { line: lineIndex }
        }

      case 'number':
        // Convert string numbers to actual numbers
        const numValue = parseInt(block.value, 10)
        if (isNaN(numValue)) {
          throw new Error(`Invalid number: ${block.value}`)
        }
        
        return {
          type: 'Literal',
          value: numValue,
          dataType: 'number',
          location: { line: lineIndex }
        }

      default:
        throw new Error(`Unsupported value type: ${block.type}`)
    }
  }
}