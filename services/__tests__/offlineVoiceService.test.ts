import {
  requestVoicePermissions,
  isVoiceAvailable,
  startOfflineListening,
  stopOfflineListening,
} from '@/services/offlineVoiceService'
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition'

jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn(),
    isRecognitionAvailable: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
}))

describe('services/offlineVoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('requests voice permissions and returns boolean result', async () => {
    ;(ExpoSpeechRecognitionModule.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    })

    const granted = await requestVoicePermissions()
    expect(granted).toBe(true)
  })

  it('checks if speech recognition is available', async () => {
    ;(ExpoSpeechRecognitionModule.isRecognitionAvailable as jest.Mock).mockResolvedValue(true)

    const available = await isVoiceAvailable()
    expect(available).toBe(true)
  })

  it('starts offline speech recognition with on-device flag', () => {
    startOfflineListening('es-MX')

    expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith(
      expect.objectContaining({
        lang: 'es-MX',
        requiresOnDeviceRecognition: true,
      })
    )
  })

  it('stops offline speech recognition', () => {
    stopOfflineListening()
    expect(ExpoSpeechRecognitionModule.stop).toHaveBeenCalled()
  })
})
