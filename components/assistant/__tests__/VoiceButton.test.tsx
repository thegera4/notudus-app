import React from 'react'
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

jest.mock('@/services/offlineVoiceService', () => ({
  startOfflineListening: jest.fn(),
  stopOfflineListening: jest.fn(),
  requestVoicePermissions: jest.fn().mockResolvedValue(true),
}))

describe('components/assistant/VoiceButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders and requests permissions on press if granted', async () => {
    const onTranscript = jest.fn()
    const tree = renderTree(<VoiceButton onTranscript={onTranscript} />)

    await React.act(async () => {
      await lastPressable(tree).props.onPress()
    })

    expect(VoiceService.requestVoicePermissions).toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const onTranscript = jest.fn()
    const tree = renderTree(<VoiceButton onTranscript={onTranscript} disabled={true} />)

    press(lastPressable(tree))
    expect(VoiceService.startOfflineListening).not.toHaveBeenCalled()
  })
})
