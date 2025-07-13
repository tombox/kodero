import type { CodeBlock, BlockType } from './codeBlocks'

export interface CodeSlotConfig {
  id: string
  acceptedTypes?: BlockType[]
  placeholder?: string
  required?: boolean
}

export interface CodeLine {
  id: string
  type: 'expression' | 'condition' | 'assignment'
  slots: CodeSlotConfig[]
  placedBlocks: (CodeBlock | null)[]
  minSlots?: number
  maxSlots?: number
}

export interface CodeStructure {
  id: string
  type: 'linear' | 'conditional' | 'loop'
  lines: CodeLine[]
  children?: CodeStructure[]
}

// Flexible code structure templates
export const CODE_TEMPLATES = {
  // Flexible expression builder: pixel = red + yellow, p = x * 2, etc.
  EXPRESSION: {
    id: 'expression',
    type: 'linear' as const,
    lines: [
      {
        id: 'expr-line',
        type: 'expression' as const,
        slots: [
          { id: 'slot-0', placeholder: 'drop here' }
        ],
        placedBlocks: [null],
        minSlots: 1,
        maxSlots: 10
      }
    ]
  },

  // If condition with flexible expressions
  IF_CONDITION: {
    id: 'if-condition',
    type: 'conditional' as const,
    lines: [
      {
        id: 'if-line',
        type: 'condition' as const,
        slots: [
          { id: 'if-keyword', acceptedTypes: ['control'], placeholder: 'if', required: true },
          { id: 'slot-1', placeholder: 'condition...' },
          { id: 'slot-2', placeholder: '...' }
        ],
        placedBlocks: [null, null, null],
        minSlots: 2,
        maxSlots: 8
      }
    ],
    children: [
      {
        id: 'if-body',
        type: 'linear' as const,
        lines: []
      },
      {
        id: 'else-body', 
        type: 'linear' as const,
        lines: []
      }
    ]
  },

  // Complete if/else with flexible bodies
  IF_ELSE: {
    id: 'if-else',
    type: 'conditional' as const,
    lines: [
      {
        id: 'if-line',
        type: 'condition' as const,
        slots: [
          { id: 'if-keyword', acceptedTypes: ['control'], placeholder: 'if', required: true },
          { id: 'slot-1', placeholder: 'condition...' },
          { id: 'slot-2', placeholder: '...' }
        ],
        placedBlocks: [null, null, null],
        minSlots: 2,
        maxSlots: 8
      }
    ],
    children: [
      {
        id: 'if-body',
        type: 'linear' as const,
        lines: []
      },
      {
        id: 'else-body',
        type: 'linear' as const,
        lines: []
      }
    ]
  }
} as const

export type CodeTemplateKey = keyof typeof CODE_TEMPLATES