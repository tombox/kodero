/**
 * Evaluation System Entry Point
 * 
 * Provides a unified interface for parsing and evaluating code structures
 * from the visual editor into color grids for the game.
 */

export { CodeParser } from './parser'
export { CodeEvaluator } from './evaluator'
export type * from './ast-types'

import { CodeParser } from './parser'
import { CodeEvaluator } from './evaluator'
import type { CodeStructure } from '../types/codeStructures'
import type { EvaluationResult } from './ast-types'

/**
 * High-level evaluation service that combines parsing and evaluation
 */
export class EvaluationService {
  private parser = new CodeParser()
  private evaluator = new CodeEvaluator()

  /**
   * Evaluate a code structure and return a color grid
   */
  evaluate(
    structure: CodeStructure, 
    gridSize: { width: number; height: number }
  ): EvaluationResult & { 
    parseErrors?: Array<{ line: number; message: string; type: 'syntax' | 'semantic' }>
  } {
    // Parse the structure first
    const parseResult = this.parser.parse(structure)
    
    if (!parseResult.success || !parseResult.ast) {
      // Return parse errors
      return {
        success: false,
        grid: this.createDefaultGrid(gridSize),
        errors: [],
        parseErrors: parseResult.errors
      }
    }

    // Evaluate the AST
    const evalResult = this.evaluator.evaluate(parseResult.ast, gridSize)
    
    return {
      ...evalResult,
      parseErrors: parseResult.errors.length > 0 ? parseResult.errors : undefined
    }
  }

  /**
   * Create a default gray grid for fallback cases
   */
  private createDefaultGrid(gridSize: { width: number; height: number }): string[][] {
    const grid: string[][] = []
    for (let y = 0; y < gridSize.height; y++) {
      grid[y] = []
      for (let x = 0; x < gridSize.width; x++) {
        grid[y][x] = 'gray'
      }
    }
    return grid
  }

  /**
   * Validate a code structure without full evaluation
   */
  validate(structure: CodeStructure): {
    valid: boolean
    errors: Array<{ line: number; message: string; type: 'syntax' | 'semantic' }>
  } {
    const parseResult = this.parser.parse(structure)
    return {
      valid: parseResult.success,
      errors: parseResult.errors
    }
  }
}

// Create and export a singleton instance
export const evaluationService = new EvaluationService()