import React from 'react'
import { Alert } from 'react-native'
import { renderTree, press, lastPressable } from '@/test-utils'
import VoiceButton from '@/components/assistant/VoiceButton'
import * as VoiceService from '@/services/offlineVoiceService'

jest.mock('expo-speech-recognition', () => ({
  useSpeechRecognitionEvent: jest.fn(),
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    start: jest.fn(),
    stop: jest.fn(),
    isRecognitionAvailable: jest.fn().mockResolvedValue(true),
  },
}))

const eventHandlers: Record<string, (event?: any) => void> = {}

jest.mock('@/services/offlineVoiceService', () => ({
  startOfflineListening: jest.fn(),
  stopOfflineListening: jest.fn(),
  requestVoicePermissions: jest.fn().mockResolvedValue(true),
  useSafeSpeechRecognitionEvent: jest.fn((eventName: string, cb: (event?: any) => void) => {
    eventHandlers[eventName] = cb
  }),
  isNativeSpeechModuleAvailable: jest.fn().mockReturnValue(true),
}))

describe('components/assistant/VoiceButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.keys(eventHandlers).forEach((k) => delete eventHandlers[k])
    ;(VoiceService.isNativeSpeechModuleAvailable as jest.Mock).mockReturnValue(true)
    ;(VoiceService.requestVoicePermissions as jest.Mock).mockResolvedValue(true)
  })

  it('renders, starts listening with onListeningStart, and stops listening on second press', async () => {
    const onTranscript = jest.fn()
    const onListeningStart = jest.fn()
    const tree = renderTree(
      <VoiceButton onTranscript={onTranscript} onListeningStart={onListeningStart} />
    )

    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })

    expect(VoiceService.requestVoicePermissions).toHaveBeenCalled()
    expect(onListeningStart).toHaveBeenCalledTimes(1)
    expect(VoiceService.startOfflineListening).toHaveBeenCalledWith('es-MX')

    // Second press stops listening
    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })
    expect(VoiceService.stopOfflineListening).toHaveBeenCalledTimes(1)
  })

  it('handles speech recognition result, end, and error events', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const onTranscript = jest.fn()
    renderTree(<VoiceButton onTranscript={onTranscript} />)

    React.act(() => {
      eventHandlers.result?.({ results: [{ transcript: 'hola mundo' }], isFinal: true })
      eventHandlers.result?.({ results: [] })
      eventHandlers.end?.()
      eventHandlers.error?.({ error: 'no-speech' })
    })

    expect(onTranscript).toHaveBeenCalledWith('hola mundo', true)
    expect(onTranscript).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith('Speech recognition event error:', 'no-speech')
    warnSpy.mockRestore()
  })

  it('shows Alert when native speech module is not available', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    ;(VoiceService.isNativeSpeechModuleAvailable as jest.Mock).mockReturnValue(false)

    const tree = renderTree(<VoiceButton onTranscript={jest.fn()} />)
    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })

    expect(alertSpy).toHaveBeenCalledWith('Modo Expo Go', expect.any(String))
    alertSpy.mockRestore()
  })

  it('shows Alert when voice permissions are denied', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    ;(VoiceService.requestVoicePermissions as jest.Mock).mockResolvedValue(false)

    const tree = renderTree(<VoiceButton onTranscript={jest.fn()} />)
    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })

    expect(alertSpy).toHaveBeenCalledWith('Permiso requerido', expect.any(String))
    alertSpy.mockRestore()
  })

  it('handles error thrown by startOfflineListening gracefully', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(VoiceService.startOfflineListening as jest.Mock).mockImplementationOnce(() => {
      throw new Error('start failed')
    })

    const tree = renderTree(<VoiceButton onTranscript={jest.fn()} />)
    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })

    expect(errorSpy).toHaveBeenCalledWith('Error starting speech recognition:', expect.any(Error))
    errorSpy.mockRestore()
  })

  it('does nothing when disabled', () => {
    const onTranscript = jest.fn()
    const tree = renderTree(<VoiceButton onTranscript={onTranscript} disabled={true} />)

    press(lastPressable(tree))
    expect(VoiceService.startOfflineListening).not.toHaveBeenCalled()
  })
})
