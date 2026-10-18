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

  it('renders assistant message with bot avatar and formatted bold text', () => {
    const message: ChatMessage = {
      id: '2',
      role: 'assistant',
      content: 'Te debe **$850** pesos en total.',
      timestamp: new Date().toISOString(),
    }
    const tree = renderTree(<ChatBubble message={message} />)
    expect(hasText(tree, '🤖')).toBe(true)
    expect(hasText(tree, '$850')).toBe(true)
  })
})
