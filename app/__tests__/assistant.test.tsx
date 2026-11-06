jest.mock('@/services/modelManagerService', () => ({
  getSelectedModelId: jest.fn().mockResolvedValue('light'),
  setSelectedModelId: jest.fn().mockResolvedValue(undefined),
  syncRemoteModelConfig: jest.fn().mockResolvedValue(null),
  getActiveCloudModelParams: jest.fn().mockResolvedValue({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: 'test-key',
    modelString: 'deepseek/deepseek-chat-v3-0324:free',
    dailyLimit: 10,
    tier: 'light',
  }),
}))

const mockGetDailyUsage = jest.fn()
const mockIncrementDailyUsage = jest.fn()

jest.mock('@/services/usageLimitService', () => ({
  getDailyUsage: (...args: any[]) => mockGetDailyUsage(...args),
  incrementDailyUsage: (...args: any[]) => mockIncrementDailyUsage(...args),
}))

jest.mock('@/services/localLlamaService', () => ({
  queryLocalModel: jest.fn(),
  selectRelevantNotes: jest.fn((notes) => notes),
}))

jest.mock('@/models/Note', () => ({
  __esModule: true,
  default: {
    getNotes: jest.fn(),
  },
}))

const mockSetAuth = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ auth: false, setAuth: mockSetAuth })),
}))

const mockAuthenticateAsync = jest.fn().mockResolvedValue({ success: true })
jest.mock('expo-local-authentication', () => ({
  authenticateAsync: (...args: any[]) => mockAuthenticateAsync(...args),
}))

let mockUuidCounter = 0
jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => `mock-uuid-${++mockUuidCounter}`,
}))

jest.mock('expo-speech-recognition', () => ({
  useSpeechRecognitionEvent: jest.fn(),
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    start: jest.fn(),
    stop: jest.fn(),
    isRecognitionAvailable: jest.fn().mockResolvedValue(true),
  },
}))

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import React from 'react'
import { act } from 'react'
import { renderTree, hasText, getTexts } from '@/test-utils'
import AssistantScreen from '@/app/(tabs)/assistant'
import * as LocalLlama from '@/services/localLlamaService'
import Note from '@/models/Note'

describe('app/(tabs)/assistant', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDailyUsage.mockResolvedValue({
      date: '2026-10-27',
      count: 2,
      limit: 10,
      remaining: 8,
      isLimitReached: false,
    })
    mockIncrementDailyUsage.mockResolvedValue({
      date: '2026-10-27',
      count: 3,
      limit: 10,
      remaining: 7,
      isLimitReached: false,
    })
  })

  it('renders chat interface and daily usage note inside the welcome message', async () => {
    ;(Note.getNotes as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Cuentas', content: 'Mama me debe $500', locked: 0, date: '2026-01-01' },
    ])

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    expect(hasText(tree, 'Assistant')).toBe(true)
    expect(hasText(tree, '10 daily messages')).toBe(true)
    expect(getTexts(tree).some((t) => t.includes('(8 remaining today)'))).toBe(true)
  })

  it('prompts biometric authentication when locked/private notes exist and increments daily counter', async () => {
    ;(Note.getNotes as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Claves', content: 'Outlook pass: 1234', locked: 1, date: '2026-01-01' },
    ])
    ;(LocalLlama.queryLocalModel as jest.Mock).mockResolvedValue('Tu pass de Outlook es 1234')

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    const input = tree.root.findByProps({ placeholder: 'Ask a question...' })
    await act(async () => {
      input.props.onChangeText('cual es mi password de outlook?')
    })

    const sendBtn = tree.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn.props.onPress()
    })

    expect(mockAuthenticateAsync).toHaveBeenCalled()
    expect(mockSetAuth).toHaveBeenCalledWith(true)
    expect(LocalLlama.queryLocalModel).toHaveBeenCalled()
    expect(mockIncrementDailyUsage).toHaveBeenCalled()
    expect(getTexts(tree).some((t) => t.includes('(7 remaining today)'))).toBe(true)
  })

  it('disables input and blocks sending when daily limit of 10 messages is reached', async () => {
    mockGetDailyUsage.mockResolvedValue({
      date: '2026-10-27',
      count: 10,
      limit: 10,
      remaining: 0,
      isLimitReached: true,
    })

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    expect(getTexts(tree).some((t) => t.includes('(0 remaining today)'))).toBe(true)
    const input = tree.root.findByProps({ placeholder: 'Daily limit of 10 messages reached' })
    expect(input.props.editable).toBe(false)
  })
})
