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
  indentLevel: number
  parentLineId?: string
  slots: CodeSlotConfig[]
  placedBlocks: (CodeBlock | null)[]
  minSlots?: number
  maxSlots?: number
}

export interface CodeStructure {
  id: string
  type: 'linear'
  lines: CodeLine[]
}

// Unified code structure template
export const CODE_TEMPLATES = {
  // Single unified template with auto-indenting
  UNIFIED: {
    id: 'unified',
    type: 'linear' as const,
    lines: [
      {
        id: 'line-0',
        type: 'expression' as const,
        indentLevel: 0,
        slots: [
          { id: 'slot-0', placeholder: 'drop here' }
        ],
        placedBlocks: [null],
        minSlots: 1,
        maxSlots: 10
      }
    ]
  }
}

export type CodeTemplateKey = keyof typeof CODE_TEMPLATES