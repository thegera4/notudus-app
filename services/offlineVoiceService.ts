import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition'

/**
 * Requests speech recognition and microphone permissions.
 */
export const requestVoicePermissions = async (): Promise<boolean> => {
  try {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    return result.granted
  } catch (error) {
    console.error('Error requesting speech permissions:', error)
    return false
  }
}

/**
 * Checks if speech recognition services are available on the device.
 */
export const isVoiceAvailable = async (): Promise<boolean> => {
  try {
    const available = await ExpoSpeechRecognitionModule.isRecognitionAvailable()
    return available
  } catch (error) {
    console.warn('Could not check recognition availability:', error)
    return false
  }
}

/**
 * Starts offline speech recognition (on-device only, zero network).
 */
export const startOfflineListening = (lang: string = 'es-MX'): void => {
  ExpoSpeechRecognitionModule.start({
    lang,
    interimResults: true,
    maxAlternatives: 1,
    continuous: false,
    requiresOnDeviceRecognition: true, // Guarantees local processing without cloud
  })
}

/**
 * Stops active speech recognition.
 */
export const stopOfflineListening = (): void => {
  try {
    ExpoSpeechRecognitionModule.stop()
  } catch (error) {
    console.warn('Error stopping speech recognition:', error)
  }
}
