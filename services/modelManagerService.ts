import AsyncStorage from '@react-native-async-storage/async-storage'
import { AIConstants } from '@/constants/AI'

export interface RemoteAIConfig {
  baseURL?: string
  model?: string
  dailyLimit?: number
}

let cachedRemoteConfig: RemoteAIConfig | null = null

const isSecureHttpsUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return url.startsWith('https://')
  }
}

/**
 * Fetches dynamic model configuration from a remote HTTPS JSON endpoint
 * so you can change models at any time without modifying app code or publishing a new Play Store build.
 */
export const syncRemoteModelConfig = async (
  configUrl: string = AIConstants.REMOTE_CONFIG_URL
): Promise<RemoteAIConfig | null> => {
  try {
    const cachedRaw = await AsyncStorage.getItem(AIConstants.REMOTE_CONFIG_STORAGE_KEY)
    if (cachedRaw) {
      cachedRemoteConfig = JSON.parse(cachedRaw)
    }
  } catch (e) {
    // Ignore storage read errors
  }

  if (!isSecureHttpsUrl(configUrl)) {
    return cachedRemoteConfig
  }

  try {
    const response = await fetch(configUrl, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    })
    if (response.ok) {
      const remoteData: RemoteAIConfig = await response.json()
      cachedRemoteConfig = remoteData
      await AsyncStorage.setItem(
        AIConstants.REMOTE_CONFIG_STORAGE_KEY,
        JSON.stringify(remoteData)
      )
      return remoteData
    }
  } catch (e) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Using cached or default AI model config (remote fetch skipped):', e)
    }
  }

  return cachedRemoteConfig
}

/**
 * Resolves the active Vercel AI SDK provider parameters (baseURL, apiKey, modelString, dailyLimit)
 * combining validated remote config overrides with environment defaults.
 */
export const getActiveCloudModelParams = async (): Promise<{
  baseURL: string
  apiKey: string
  modelString: string
  dailyLimit: number
}> => {
  const remote = cachedRemoteConfig ?? (await syncRemoteModelConfig())

  const baseURL =
    remote?.baseURL && isSecureHttpsUrl(remote.baseURL)
      ? remote.baseURL
      : AIConstants.API_BASE_URL
  const apiKey = AIConstants.API_KEY
  const modelString =
    typeof remote?.model === 'string' && /^[a-zA-Z0-9._/:+-]{2,120}$/.test(remote.model)
      ? remote.model
      : AIConstants.MODEL
  const dailyLimit =
    typeof remote?.dailyLimit === 'number' &&
    remote.dailyLimit >= 1 &&
    remote.dailyLimit <= 50
      ? Math.floor(remote.dailyLimit)
      : AIConstants.MAX_DAILY_MESSAGES

  return {
    baseURL,
    apiKey,
    modelString,
    dailyLimit,
  }
}
