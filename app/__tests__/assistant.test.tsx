const mockGetActiveCloudModelParams = jest.fn()

jest.mock('@/services/modelManagerService', () => ({
  getSelectedModelId: jest.fn().mockResolvedValue('light'),
  setSelectedModelId: jest.fn().mockResolvedValue(undefined),
  syncRemoteModelConfig: jest.fn().mockResolvedValue(null),
  getActiveCloudModelParams: (...args: any[]) => mockGetActiveCloudModelParams(...args),
}))

const mockGetDailyUsage = jest.fn()
const mockIncrementDailyUsage = jest.fn()
const mockResetDailyUsage = jest.fn()

jest.mock('@/services/usageLimitService', () => ({
  getDailyUsage: (...args: any[]) => mockGetDailyUsage(...args),
  incrementDailyUsage: (...args: any[]) => mockIncrementDailyUsage(...args),
  resetDailyUsage: (...args: any[]) => mockResetDailyUsage(...args),
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
let mockAuthValue = false
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ auth: mockAuthValue, setAuth: mockSetAuth })),
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

jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import React, { act } from 'react'
import { Alert, AppState, FlatList, Platform } from 'react-native'
import { renderTree, hasText, getTexts, findPressables } from '@/test-utils'
import AssistantScreen from '@/app/(tabs)/assistant'
import * as LocalLlama from '@/services/localLlamaService'
import Note from '@/models/Note'
import { Strings } from '@/constants/Strings'

describe('app/(tabs)/assistant', () => {
  let appStateCallback: ((state: any) => void) | null = null
  const mockRemoveSub = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthValue = false
    appStateCallback = null
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event: any, cb: any) => {
      appStateCallback = cb
      return { remove: mockRemoveSub } as any
    })
    mockGetActiveCloudModelParams.mockResolvedValue({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'test-key',
      modelString: 'deepseek/deepseek-chat-v3-0324:free',
      dailyLimit: 10,
      tier: 'light',
    })
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
    mockResetDailyUsage.mockResolvedValue({
      date: '2026-10-27',
      count: 0,
      limit: 10,
      remaining: 10,
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

  it('handles AppState background transitions and initAssistant errors', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockGetActiveCloudModelParams.mockRejectedValueOnce(new Error('init failed'))

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    expect(warnSpy).toHaveBeenCalledWith('Error initializing assistant state:', expect.any(Error))

    act(() => {
      appStateCallback?.('active')
      appStateCallback?.('background')
    })
    expect(mockSetAuth).toHaveBeenCalledWith(false)

    act(() => {
      tree.unmount()
    })
    expect(mockRemoveSub).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('handles top bar lock toggle and clear chat confirmation', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    // TopBar buttons: [0] is lock, [1] is clear chat
    const topBarButtons = findPressables(tree)

    // 1. Lock press when auth=false and biometric succeeds
    mockAuthenticateAsync.mockResolvedValueOnce({ success: true })
    await act(async () => {
      await topBarButtons[0].props.onPress()
    })
    expect(mockSetAuth).toHaveBeenCalledWith(true)

    // 2. Lock press when auth=false and biometric fails
    mockAuthenticateAsync.mockResolvedValueOnce({ success: false })
    await act(async () => {
      await topBarButtons[0].props.onPress()
    })
    expect(alertSpy).toHaveBeenCalledWith(
      Strings.MODALS.NO_AUTH_METHOD,
      Strings.MODALS.NO_AUTH_MESSAGE,
      [{ text: 'OK' }]
    )

    // 3. Lock press when auth=false and biometric throws
    mockAuthenticateAsync.mockRejectedValueOnce(new Error('auth error'))
    await act(async () => {
      await topBarButtons[0].props.onPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.AUTH_ERROR, expect.any(Error))

    // 4. Clear chat button triggers Alert and confirming resets messages & daily usage
    act(() => {
      topBarButtons[1].props.onPress()
    })
    const clearAlertCall = alertSpy.mock.calls.find((c) => c[0] === Strings.ASSISTANT.CLEAR_CHAT)
    const clearAction = (clearAlertCall?.[2] as any[])?.find((btn) => btn.text === 'Clear')
    await act(async () => {
      await clearAction.onPress()
    })
    expect(mockResetDailyUsage).toHaveBeenCalledWith(10)

    // 5. Lock press when auth=true locks immediately
    mockAuthValue = true
    let authedTree: any
    await act(async () => {
      authedTree = renderTree(<AssistantScreen />)
    })
    const authedButtons = findPressables(authedTree)
    await act(async () => {
      await authedButtons[0].props.onPress()
    })
    expect(mockSetAuth).toHaveBeenCalledWith(false)

    alertSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('prompts biometric authentication when locked/private notes exist, streams tokens, and increments daily counter', async () => {
    ;(Note.getNotes as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Claves', content: 'Outlook pass: 1234', locked: 1, date: '2026-01-01' },
    ])
    mockAuthenticateAsync.mockResolvedValueOnce({ success: true })
    ;(LocalLlama.queryLocalModel as jest.Mock).mockImplementation(
      async (_q: string, _notes: any[], onToken?: (t: string) => void) => {
        onToken?.('Tu pass de Outlook es 1234')
        return 'Tu pass de Outlook es 1234'
      }
    )

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    const flatList = tree.root.findByType(FlatList)
    act(() => {
      flatList.props.onContentSizeChange?.()
      flatList.props.onLayout?.()
    })

    const input = tree.root.findByProps({ placeholder: 'Ask a question...' })
    jest.useFakeTimers()
    act(() => {
      input.props.onFocus?.()
      jest.runAllTimers()
    })
    jest.useRealTimers()

    // Pressing send with empty input does nothing
    const sendBtnEmpty = tree.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtnEmpty.props.onPress()
    })
    expect(LocalLlama.queryLocalModel).not.toHaveBeenCalled()

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

  it('handles empty notes, biometric failure fallback, non-streamed empty response, and inference errors', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Case A: Biometric prompt throws -> falls back to unlocked notes (which is empty -> NO_NOTES)
    ;(Note.getNotes as jest.Mock)
      .mockResolvedValueOnce([
        { id: '1', title: '', content: 'secret', locked: 1, date: '2026-01-01' },
      ])
      .mockResolvedValueOnce([])
    mockAuthenticateAsync.mockRejectedValueOnce(new Error('biometric error'))

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    const input = tree.root.findByProps({ placeholder: 'Ask a question...' })
    await act(async () => {
      input.props.onChangeText('pregunta 1')
    })
    const sendBtn = tree.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn.props.onPress()
    })
    expect(warnSpy).toHaveBeenCalledWith('Biometric prompt skipped or failed:', expect.any(Error))
    expect(hasText(tree, Strings.ASSISTANT.NO_NOTES)).toBe(true)

    // Case B: Biometric prompt returns success: false -> falls back to unlocked notes (which has 0 private notes)
    ;(Note.getNotes as jest.Mock)
      .mockResolvedValueOnce([
        { id: '1', title: 'Secret', content: 'secret', locked: 1, date: '2026-01-01' },
      ])
      .mockResolvedValueOnce([
        { id: '2', title: 'Public', content: 'public', locked: 0, date: '2026-01-02' },
      ])
    mockAuthenticateAsync.mockResolvedValueOnce({ success: false })
    ;(LocalLlama.queryLocalModel as jest.Mock).mockResolvedValueOnce('Respuesta pública')

    await act(async () => {
      input.props.onChangeText('pregunta 1b')
    })
    const sendBtn1b = tree.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn1b.props.onPress()
    })
    expect(hasText(tree, 'Respuesta pública')).toBe(true)

    // Case C: No private notes when unauthenticated (hasPrivateNotes === false) + Android platform
    const prevOS = Platform.OS
    Platform.OS = 'android'
    ;(Note.getNotes as jest.Mock).mockResolvedValue([
      { id: '2', title: '', content: 'nota pública', locked: 0, date: '2026-01-02' },
    ])
    ;(LocalLlama.queryLocalModel as jest.Mock).mockResolvedValueOnce('')

    let tree2: any
    await act(async () => {
      tree2 = renderTree(<AssistantScreen />)
    })
    Platform.OS = prevOS
    const input2 = tree2.root.findByProps({ placeholder: 'Ask a question...' })
    await act(async () => {
      input2.props.onChangeText('pregunta 2')
    })
    const sendBtn2 = tree2.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn2.props.onPress()
    })
    expect(
      hasText(tree2, 'No se recibió respuesta del modelo. Intenta preguntar de nuevo.')
    ).toBe(true)

    // Case D: Already authenticated (auth=true) and queryLocalModel throws an error
    mockAuthValue = true
    let tree3: any
    await act(async () => {
      tree3 = renderTree(<AssistantScreen />)
    })
    const input3 = tree3.root.findByProps({ placeholder: 'Ask a question...' })
    ;(LocalLlama.queryLocalModel as jest.Mock).mockRejectedValueOnce(new Error('API down'))
    await act(async () => {
      input3.props.onChangeText('pregunta 3')
    })
    const sendBtn3 = tree3.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn3.props.onPress()
    })
    expect(errorSpy).toHaveBeenCalledWith('Error during AI inference:', expect.any(Error))

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('disables input and blocks sending when daily limit of 10 messages is reached', async () => {
    // First render with remaining=1, then on send getDailyUsage returns isLimitReached=true
    mockGetDailyUsage
      .mockResolvedValueOnce({
        date: '2026-10-27',
        count: 9,
        limit: 10,
        remaining: 1,
        isLimitReached: false,
      })
      .mockResolvedValueOnce({
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

    const input = tree.root.findByProps({ placeholder: 'Ask a question...' })
    await act(async () => {
      input.props.onChangeText('una pregunta más')
    })
    const sendBtn = tree.root.findAllByProps({ activeOpacity: 0.7 }).pop()
    await act(async () => {
      await sendBtn.props.onPress()
    })

    expect(hasText(tree, Strings.ASSISTANT.DAILY_LIMIT_REACHED)).toBe(true)
    const disabledInput = tree.root.findByProps({
      placeholder: 'Daily limit of 10 messages reached',
    })
    expect(disabledInput.props.editable).toBe(false)
  })
})
