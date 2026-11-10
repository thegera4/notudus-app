import React from 'react'
import { renderTree, hasText } from '@/test-utils'
import ChatBubble from '@/components/assistant/ChatBubble'
import { ChatMessage } from '@/types'

describe('components/assistant/ChatBubble', () => {
  it('renders user message correctly', () => {
    const message: ChatMessage = {
      id: '1',
      role: 'user',
      content: '¿Cuánto me debe mi mamá?',
      timestamp: new Date().toISOString(),
    }
    const tree = renderTree(<ChatBubble message={message} />)
    expect(hasText(tree, '¿Cuánto me debe mi mamá?')).toBe(true)
  })

  it('renders assistant message with bot avatar, headings, multi-line text, and formatted bold text', () => {
    const message: ChatMessage = {
      id: '2',
      role: 'assistant',
      content: '### Resumen de cuenta\nTe debe **$850** pesos en total.\nSegunda línea.',
      timestamp: new Date().toISOString(),
    }
    const tree = renderTree(<ChatBubble message={message} />)
    expect(hasText(tree, '🤖')).toBe(true)
    expect(hasText(tree, 'Resumen de cuenta')).toBe(true)
    expect(hasText(tree, '$850')).toBe(true)
    expect(hasText(tree, 'Segunda línea.')).toBe(true)
  })

  it('renders markdown tables with headers, negative amounts, and total/saldo rows', () => {
    const message: ChatMessage = {
      id: '3',
      role: 'assistant',
      content: [
        'Aquí tienes el desglose:',
        '| Concepto | Monto |',
        '| --- | --- |',
        '| Despensa | $500 |',
        '| Abono lunes | -$150 |',
        '| **Saldo total** | **$350** |',
      ].join('\n'),
      timestamp: new Date().toISOString(),
    }
    const tree = renderTree(<ChatBubble message={message} />)
    expect(hasText(tree, 'Concepto')).toBe(true)
    expect(hasText(tree, 'Despensa')).toBe(true)
    expect(hasText(tree, '-$150')).toBe(true)
    expect(hasText(tree, 'Saldo total')).toBe(true)
    expect(hasText(tree, '$350')).toBe(true)
  })

  it('returns null for a table block containing only separator rows', () => {
    const message: ChatMessage = {
      id: '4',
      role: 'assistant',
      content: '| --- | --- |',
      timestamp: new Date().toISOString(),
    }
    const tree = renderTree(<ChatBubble message={message} />)
    expect(hasText(tree, '🤖')).toBe(true)
  })
})
