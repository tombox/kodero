// Core types for the code block system
export type BlockType = 'variable' | 'number' | 'operator' | 'color' | 'control'

export type VariableValue = 'x' | 'y' | 'p'
export type NumberValue = '0' | '1' | '2' | '3' | '4'
export type OperatorValue = '=' | '==' | '!=' | '<' | '>' | '<=' | '>='
export type ColorValue = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray'
export type ControlValue = 'if' | 'else'

export type BlockValue = VariableValue | NumberValue | OperatorValue | ColorValue | ControlValue | string

export interface CodeBlock {
  id: string
  type: BlockType
  value: BlockValue
  disabled?: boolean
}

// Specific block interfaces for type safety
export interface VariableBlock extends CodeBlock {
  type: 'variable'
  value: VariableValue
}

export interface NumberBlock extends CodeBlock {
  type: 'number'
  value: NumberValue
}

export interface OperatorBlock extends CodeBlock {
  type: 'operator'
  value: OperatorValue
}

export interface ColorBlock extends CodeBlock {
  type: 'color'
  value: ColorValue
}

export interface ControlBlock extends CodeBlock {
  type: 'control'
  value: ControlValue
}

// Union type for all specific blocks
export type TypedCodeBlock = VariableBlock | NumberBlock | OperatorBlock | ColorBlock | ControlBlock

// Block categories for styling and organization
export const BLOCK_CATEGORIES = {
  variable: {
    name: 'Variables',
    color: '#ff9500', // Orange
    description: 'Position and pixel variables'
  },
  number: {
    name: 'Numbers',
    color: '#ffffff', // White
    description: 'Numeric values'
  },
  operator: {
    name: 'Operators',
    color: '#4cd964', // Green
    description: 'Comparison and assignment operators'
  },
  color: {
    name: 'Colors',
    color: 'var(--block-color)', // Dynamic based on color value
    description: 'Color values for pixels'
  },
  control: {
    name: 'Control Flow',
    color: '#ffcc00', // Yellow
    description: 'Conditional statements'
  }
} as const

// Predefined blocks for the toolbox
export const AVAILABLE_BLOCKS: readonly CodeBlock[] = [
  // Variables
  { id: 'var-x', type: 'variable', value: 'x' },
  { id: 'var-y', type: 'variable', value: 'y' },
  { id: 'var-p', type: 'variable', value: 'p' },
  
  // Numbers
  { id: 'num-0', type: 'number', value: '0' },
  { id: 'num-1', type: 'number', value: '1' },
  { id: 'num-2', type: 'number', value: '2' },
  { id: 'num-3', type: 'number', value: '3' },
  { id: 'num-4', type: 'number', value: '4' },
  
  // Operators
  { id: 'op-assign', type: 'operator', value: '=' },
  { id: 'op-equals', type: 'operator', value: '==' },
  { id: 'op-not-equals', type: 'operator', value: '!=' },
  { id: 'op-less', type: 'operator', value: '<' },
  { id: 'op-greater', type: 'operator', value: '>' },
  { id: 'op-less-equal', type: 'operator', value: '<=' },
  { id: 'op-greater-equal', type: 'operator', value: '>=' },
  
  // Colors
  { id: 'color-red', type: 'color', value: 'red' },
  { id: 'color-blue', type: 'color', value: 'blue' },
  { id: 'color-green', type: 'color', value: 'green' },
  { id: 'color-yellow', type: 'color', value: 'yellow' },
  { id: 'color-purple', type: 'color', value: 'purple' },
  
  // Control Flow
  { id: 'ctrl-if', type: 'control', value: 'if' },
  { id: 'ctrl-else', type: 'control', value: 'else' }
] as const

// Helper functions for working with blocks
export function createBlock(type: BlockType, value: BlockValue, id?: string): CodeBlock {
  return {
    id: id || `${type}-${value}-${Date.now()}`,
    type,
    value
  }
}

export function isValidBlockType(type: string): type is BlockType {
  return ['variable', 'number', 'operator', 'color', 'control'].includes(type)
}

export function getBlockDisplayName(block: CodeBlock): string {
  return `${BLOCK_CATEGORIES[block.type].name}: ${block.value}`
}

export function getBlockColor(block: CodeBlock): string {
  if (block.type === 'color') {
    return block.value as string
  }
  return BLOCK_CATEGORIES[block.type].color
}