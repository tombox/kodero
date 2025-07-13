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
  ASTNode,
  ConditionalNode,
  BinaryOperationNode
} from './ast-types'

export class CodeParser {
  /**
   * Parse a code structure from the visual editor into an AST
   */
  parse(structure: CodeStructure): ParseResult {
    const errors: ParseResult['errors'] = []
    const statements: ASTNode[] = []
    const processedLines = new Set<string>()

    // Process each line in the structure, handling nesting
    for (let i = 0; i < structure.lines.length; i++) {
      const line = structure.lines[i]
      
      // Skip lines that have already been processed as children
      if (processedLines.has(line.id)) {
        continue
      }
      
      try {
        const statement = this.parseLineWithChildren(line, i, structure, processedLines)
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
   * Parse a line and its children, handling nested structures
   */
  private parseLineWithChildren(
    line: CodeLine, 
    lineIndex: number, 
    structure: CodeStructure, 
    processedLines: Set<string>
  ): ASTNode | null {
    processedLines.add(line.id)
    
    const statement = this.parseLine(line, lineIndex)
    if (!statement) {
      return null
    }

    // If this is a conditional, find and parse its child statements and else clause
    if (statement.type === 'Conditional') {
      const conditional = statement as ConditionalNode
      const currentLineIndex = structure.lines.indexOf(line)
      
      // Find child lines for the then body (direct children of this if statement)
      const thenChildLines = structure.lines.filter(childLine => 
        childLine.parentLineId === line.id
      )

      for (const childLine of thenChildLines) {
        // Skip else lines - they'll be handled separately
        const childBlocks = childLine.placedBlocks.filter((block): block is CodeBlock => block !== null)
        if (childBlocks.length > 0 && childBlocks[0].type === 'control' && childBlocks[0].value === 'else') {
          continue
        }
        
        // Mark child line as processed before parsing
        processedLines.add(childLine.id)
        
        const childIndex = structure.lines.indexOf(childLine)
        try {
          const childStatement = this.parseLineWithChildren(childLine, childIndex, structure, processedLines)
          if (childStatement) {
            conditional.thenBody.push(childStatement)
          }
        } catch (error) {
          throw new Error(`Error in nested statement: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      // Look for else statement that follows this if at the same level
      const elseLine = this.findElseLine(structure, line, currentLineIndex)
      if (elseLine) {
        processedLines.add(elseLine.id)
        
        // Find child lines for the else body
        const elseChildLines = structure.lines.filter(childLine => 
          childLine.parentLineId === elseLine.id
        )

        conditional.elseBody = []
        for (const childLine of elseChildLines) {
          // Mark child line as processed before parsing
          processedLines.add(childLine.id)
          
          const childIndex = structure.lines.indexOf(childLine)
          try {
            const childStatement = this.parseLineWithChildren(childLine, childIndex, structure, processedLines)
            if (childStatement) {
              conditional.elseBody.push(childStatement)
            }
          } catch (error) {
            throw new Error(`Error in nested statement: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }
    }

    return statement
  }

  /**
   * Find the else line that corresponds to an if statement
   */
  private findElseLine(structure: CodeStructure, ifLine: CodeLine, ifLineIndex: number): CodeLine | null {
    // Look for else line that:
    // 1. Comes after the if line
    // 2. Has the same parent (is a sibling)
    // 3. Contains an 'else' control block
    
    for (let i = ifLineIndex + 1; i < structure.lines.length; i++) {
      const line = structure.lines[i]
      
      // Check if this line is an else statement
      const blocks = line.placedBlocks.filter((block): block is CodeBlock => block !== null)
      if (blocks.length > 0 && blocks[0].type === 'control' && blocks[0].value === 'else') {
        // Check if it's at the same level (has same parent) as the if statement
        if (line.parentLineId === ifLine.parentLineId) {
          return line
        }
      }
      
      // If we encounter another if statement at the same level, stop looking
      if (blocks.length > 0 && blocks[0].type === 'control' && blocks[0].value === 'if') {
        if (line.parentLineId === ifLine.parentLineId) {
          break
        }
      }
    }
    
    return null
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

    // Skip else lines - they'll be handled as part of if-else parsing
    if (blocks.length > 0 && blocks[0].type === 'control' && blocks[0].value === 'else') {
      return null
    }

    // Try to parse as conditional first
    if (this.looksLikeConditional(blocks)) {
      return this.parseConditional(blocks, lineIndex, line)
    }

    // Try to parse as assignment
    if (this.looksLikeAssignment(blocks)) {
      return this.parseAssignment(blocks, lineIndex)
    }

    // If we can't recognize the pattern, it's an error
    throw new Error(`Unrecognized code pattern at line ${lineIndex + 1}`)
  }

  /**
   * Check if blocks look like they're trying to be a conditional
   */
  private looksLikeConditional(blocks: CodeBlock[]): boolean {
    // If it starts with 'if' control block, treat as conditional attempt
    return (
      blocks.length >= 1 && 
      blocks[0].type === 'control' && 
      blocks[0].value === 'if'
    )
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
   * Parse a conditional pattern into a ConditionalNode
   */
  private parseConditional(blocks: CodeBlock[], lineIndex: number, line: CodeLine): ConditionalNode {
    // Basic validation: if <variable> <operator> <value>
    if (blocks.length < 4) {
      throw new Error('Invalid if condition: expected format "if variable operator value"')
    }

    if (blocks[0].type !== 'control' || blocks[0].value !== 'if') {
      throw new Error('Invalid conditional: expected "if" keyword')
    }

    // Parse the condition as a binary operation
    const leftOperand = this.parseValue(blocks[1], lineIndex)
    
    if (blocks[2].type !== 'operator') {
      throw new Error('Invalid condition: expected comparison operator')
    }
    
    const operator = blocks[2].value
    const validOperators = ['==', '!=', '<', '>', '<=', '>=']
    if (!validOperators.includes(operator)) {
      throw new Error(`Invalid comparison operator: ${operator}`)
    }

    const rightOperand = this.parseValue(blocks[3], lineIndex)

    const condition: BinaryOperationNode = {
      type: 'BinaryOperation',
      operator: operator as BinaryOperationNode['operator'],
      left: leftOperand,
      right: rightOperand,
      location: { line: lineIndex }
    }

    // Find child statements - look for lines with this line as parent
    const thenBody: ASTNode[] = []
    
    // In the current implementation, we need to look at the structure to find child lines
    // For now, we'll create the conditional with empty body and let the main parse loop handle nesting
    
    return {
      type: 'Conditional',
      condition,
      thenBody,
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