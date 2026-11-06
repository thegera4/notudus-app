import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ChatBubbleProps } from '@/types'

interface ContentBlock {
  type: 'text' | 'table'
  lines: string[]
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  const renderInlineBold = (text: string, keyPrefix: string, defaultStyle = styles.normalText) => {
    const cleanedHeading = text.replace(/^#{1,4}\s+/, '')
    const isHeading = /^#{1,4}\s+/.test(text)
    const parts = cleanedHeading.split(/(\*\*[^*]+\*\*)/g)

    return parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={`${keyPrefix}-p-${partIndex}`} style={styles.boldText}>
            {part.slice(2, -2)}
          </Text>
        )
      }
      return (
        <Text
          key={`${keyPrefix}-p-${partIndex}`}
          style={isHeading ? styles.headingText : defaultStyle}
        >
          {part}
        </Text>
      )
    })
  }

  const parseBlocks = (content: string): ContentBlock[] => {
    const rawLines = content.split('\n')
    const blocks: ContentBlock[] = []

    for (const line of rawLines) {
      const trimmed = line.trim()
      const isTableRow = trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2

      if (isTableRow) {
        const prev = blocks[blocks.length - 1]
        if (prev && prev.type === 'table') {
          prev.lines.push(trimmed)
        } else {
          blocks.push({ type: 'table', lines: [trimmed] })
        }
      } else {
        const prev = blocks[blocks.length - 1]
        if (prev && prev.type === 'text') {
          prev.lines.push(line)
        } else {
          blocks.push({ type: 'text', lines: [line] })
        }
      }
    }

    return blocks
  }

  const renderTableBlock = (tableLines: string[], blockIndex: number) => {
    // Filter out markdown separator rows like | --- | --- |
    const dataRows = tableLines
      .map((row) =>
        row
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim())
      )
      .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c) || c === ''))

    if (dataRows.length === 0) return null

    return (
      <View key={`table-${blockIndex}`} style={styles.tableContainer}>
        {dataRows.map((cells, rowIndex) => {
          const isHeader = rowIndex === 0 && dataRows.length > 1
          const rowJoined = cells.join(' ').toLowerCase()
          const isTotalRow =
            !isHeader &&
            (rowJoined.includes('total') ||
              rowJoined.includes('saldo') ||
              cells.some((c) => c.includes('**')))

          return (
            <View
              key={`row-${rowIndex}`}
              style={[
                styles.tableRow,
                isHeader && styles.tableHeaderRow,
                isTotalRow && styles.tableTotalRow,
                rowIndex === dataRows.length - 1 && styles.tableLastRow,
              ]}
            >
              {cells.map((cell, colIndex) => {
                const isLastCol = colIndex === cells.length - 1 && cells.length > 1
                const isNegative = cell.startsWith('-$') || cell.startsWith('- $')
                return (
                  <View
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={[
                      styles.tableCell,
                      isLastCol ? styles.tableCellAmount : styles.tableCellConcept,
                    ]}
                  >
                    <Text
                      selectable
                      style={[
                        styles.tableCellText,
                        isHeader && styles.tableHeaderText,
                        isLastCol && styles.tableAmountText,
                        isNegative && styles.tableNegativeText,
                      ]}
                    >
                      {renderInlineBold(
                        cell,
                        `t-${blockIndex}-${rowIndex}-${colIndex}`,
                        isHeader
                          ? styles.tableHeaderText
                          : isNegative
                            ? styles.tableNegativeText
                            : styles.tableCellText
                      )}
                    </Text>
                  </View>
                )
              })}
            </View>
          )
        })}
      </View>
    )
  }

  const blocks = parseBlocks(message.content)
  const hasTable = blocks.some((b) => b.type === 'table')

  return (
    <View style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🤖</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          !isUser && hasTable && styles.bubbleWithTable,
        ]}
      >
        {blocks.map((block, bIdx) => {
          if (block.type === 'table') {
            return renderTableBlock(block.lines, bIdx)
          }
          return (
            <Text key={`txt-${bIdx}`} selectable style={styles.textContent}>
              {block.lines.map((line, lineIndex) => (
                <Text key={`line-${bIdx}-${lineIndex}`} style={styles.textLine}>
                  {renderInlineBold(line, `l-${bIdx}-${lineIndex}`)}
                  {lineIndex < block.lines.length - 1 ? '\n' : ''}
                </Text>
              ))}
            </Text>
          )
        })}
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
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleWithTable: {
    flex: 1,
    maxWidth: '90%',
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
  headingText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#66bb6a',
  },
  tableContainer: {
    width: '100%',
    alignSelf: 'stretch',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#484848',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#222222',
  },
  tableRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#383838',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: '#181818',
    borderBottomColor: '#484848',
  },
  tableTotalRow: {
    backgroundColor: '#1b2e1e',
  },
  tableLastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 2,
  },
  tableCellConcept: {
    flex: 1,
    paddingRight: 12,
  },
  tableCellAmount: {
    minWidth: 88,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tableCellText: {
    color: '#e0e0e0',
    fontSize: 13.5,
  },
  tableHeaderText: {
    color: '#9e9e9e',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableAmountText: {
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  tableNegativeText: {
    color: '#ef9a9a',
    fontSize: 13.5,
  },
})
