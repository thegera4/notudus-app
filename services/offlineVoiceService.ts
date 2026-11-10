let speechModule: any = null
let speechEventHook: (eventName: string, listener: (event: any) => void) => void = () => {}

try {
  // Guarded dynamic require so running inside Expo Go (which does not bundle
  // custom third-party native modules) does not crash on startup.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require('expo-speech-recognition')
  speechModule = pkg.ExpoSpeechRecognitionModule ?? null
  if (typeof pkg.useSpeechRecognitionEvent === 'function') {
    speechEventHook = pkg.useSpeechRecognitionEvent
  }
} catch {
  speechModule = null
}

/**
 * Returns true if the native ExpoSpeechRecognition module is linked in this binary.
 */
export const isNativeSpeechModuleAvailable = (): boolean => {
  return Boolean(speechModule)
}

/**
 * Safe wrapper around `useSpeechRecognitionEvent` that no-ops in Expo Go.
 */
export const useSafeSpeechRecognitionEvent = (
  eventName: string,
  listener: (event: any) => void
): void => {
  speechEventHook(eventName, listener)
}

/**
 * Requests speech recognition and microphone permissions.
 */
export const requestVoicePermissions = async (): Promise<boolean> => {
  if (!speechModule) return false
  try {
    const result = await speechModule.requestPermissionsAsync()
    return Boolean(result?.granted)
  } catch (error) {
    console.error('Error requesting speech permissions:', error)
    return false
  }
}

/**
 * Checks if speech recognition services are available on the device.
 */
export const isVoiceAvailable = async (): Promise<boolean> => {
  if (!speechModule) return false
  try {
    const available = await speechModule.isRecognitionAvailable()
    return Boolean(available)
  } catch (error) {
    console.warn('Could not check recognition availability:', error)
    return false
  }
}

/**
 * Starts offline speech recognition (on-device only, zero network).
 */
export const startOfflineListening = (lang: string = 'es-MX'): void => {
  if (!speechModule) return
  speechModule.start({
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
  if (!speechModule) return
  try {
    speechModule.stop()
  } catch (error) {
    console.warn('Error stopping speech recognition:', error)
  }
}
