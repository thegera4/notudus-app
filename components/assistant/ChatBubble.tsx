import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ChatBubbleProps } from '@/types'

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  // Simple formatting helper for **bold** text and bullet points
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, lineIndex) => {
      // Split line by bold tokens (**text**)
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return (
        <Text key={`line-${lineIndex}`} style={styles.textLine}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <Text key={`part-${partIndex}`} style={styles.boldText}>
                  {part.slice(2, -2)}
                </Text>
              )
            }
            return (
              <Text key={`part-${partIndex}`} style={styles.normalText}>
                {part}
              </Text>
            )
          })}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      )
    })
  }

  return (
    <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.textContent}>{renderFormattedText(message.content)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bubbleContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#1b5e20',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#303030',
    borderBottomLeftRadius: 4,
  },
  textContent: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  textLine: {
    color: '#ffffff',
    fontSize: 15,
  },
  normalText: {
    color: '#ffffff',
    fontSize: 15,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#66bb6a',
  },
})
