import type { CodeStructure, CodeLine } from '../types/codeStructures'
import type { CodeBlock } from '../types/codeBlocks'
import { AVAILABLE_BLOCKS } from '../types/codeBlocks'

/**
 * Helper to create a code block by ID
 */
function getBlockById(blockId: string): CodeBlock | null {
  const block = AVAILABLE_BLOCKS.find(b => b.id === blockId)
  if (!block) return null
  
  // Create a unique instance of the block
  return {
    ...block,
    id: `placed-${blockId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Create a code line with pre-filled blocks and empty slots
 * @param blocks Array of block IDs or null for empty slots
 * @param options Additional line options
 */
export function createCodeLine(
  blocks: (string | null)[],
  options: {
    type?: 'expression' | 'condition' | 'assignment'
    indentLevel?: number
    parentLineId?: string
  } = {}
): CodeLine {
  const lineId = `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Create slots and placed blocks
  const slots = blocks.map((_, index) => ({
    id: `slot-${index}`,
    placeholder: 'drop here'
  }))
  
  const placedBlocks = blocks.map(blockId => 
    blockId ? getBlockById(blockId) : null
  )
  
  return {
    id: lineId,
    type: options.type || 'expression',
    indentLevel: options.indentLevel || 0,
    parentLineId: options.parentLineId,
    slots,
    placedBlocks,
    minSlots: slots.length,
    maxSlots: 10
  }
}

/**
 * Create a code structure with pre-filled lines
 */
export function createCodeStructure(lines: CodeLine[]): CodeStructure {
  return {
    id: `structure-${Date.now()}`,
    type: 'linear',
    lines
  }
}

/**
 * Pre-built code templates for common patterns
 */
export const CODE_PATTERNS = {
  // Simple assignment with one blank: p = [blank]
  simpleAssignment: (variable = 'var-p') => 
    createCodeStructure([
      createCodeLine([variable, 'op-assign', null])
    ]),
  
  // If statement with blanks: if [blank] [op] [blank] then p = [blank]
  ifStatement: () => {
    const ifLine = createCodeLine(['ctrl-if', null, null, null])
    const thenLine = createCodeLine(['var-p', 'op-assign', null], {
      indentLevel: 1,
      parentLineId: ifLine.id
    })
    
    return createCodeStructure([ifLine, thenLine])
  },
  
  // Center stripe pattern - partially filled
  centerStripePattern: () => {
    const ifLine = createCodeLine(['ctrl-if', 'var-x', 'op-equals', null])
    const thenLine = createCodeLine([null, null, 'color-red'], {
      indentLevel: 1,
      parentLineId: ifLine.id
    })
    const elseLine = createCodeLine(['ctrl-else'], {
      indentLevel: 0,
      parentLineId: ifLine.id
    })
    const elseBodyLine = createCodeLine(['var-p', null, null], {
      indentLevel: 1,
      parentLineId: elseLine.id
    })
    
    return createCodeStructure([ifLine, thenLine, elseLine, elseBodyLine])
  },
  
  // If-else with blanks
  ifElseStatement: () => {
    const ifLine = createCodeLine(['ctrl-if', null, null, null])
    const thenLine = createCodeLine(['var-p', 'op-assign', null], {
      indentLevel: 1,
      parentLineId: ifLine.id
    })
    const elseLine = createCodeLine(['ctrl-else'], {
      indentLevel: 0
    })
    const elseBodyLine = createCodeLine(['var-p', 'op-assign', null], {
      indentLevel: 1,
      parentLineId: elseLine.id
    })
    
    // Set up parent relationships for else block
    elseLine.parentLineId = ifLine.id
    
    return createCodeStructure([ifLine, thenLine, elseLine, elseBodyLine])
  },
  
  // Checkerboard pattern template with some pre-filled blocks
  checkerboardTemplate: () => {
    const ifLine = createCodeLine(['ctrl-if', null, null, null, null, null, null, null])
    const thenLine = createCodeLine(['var-p', 'op-assign', null], {
      indentLevel: 1,
      parentLineId: ifLine.id
    })
    const elseLine = createCodeLine(['ctrl-else'], {
      indentLevel: 0
    })
    const elseBodyLine = createCodeLine(['var-p', 'op-assign', null], {
      indentLevel: 1,
      parentLineId: elseLine.id
    })
    
    // Set up parent relationships for else block
    elseLine.parentLineId = ifLine.id
    
    return createCodeStructure([ifLine, thenLine, elseLine, elseBodyLine])
  },
  
  // Custom pattern with specified blocks and blanks
  custom: (pattern: (string | null)[][]) => {
    const lines = pattern.map((lineBlocks, index) => {
      const previousLines = pattern.slice(0, index).map((_, i) => `line-${i}`)
      const indentLevel = lineBlocks[0] === 'ctrl-else' ? 0 : 
                         (index > 0 && pattern[index - 1][0] === 'ctrl-if') ? 1 : 0
      
      return createCodeLine(lineBlocks, {
        indentLevel,
        parentLineId: indentLevel > 0 ? previousLines[previousLines.length - 1] : undefined
      })
    })
    
    return createCodeStructure(lines)
  }
}