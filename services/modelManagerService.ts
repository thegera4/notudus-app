import * as FileSystem from 'expo-file-system'
import { AIConstants } from '@/constants/AI'

const MODELS_DIR = `${FileSystem.documentDirectory}models/`
const MODEL_PATH = `${MODELS_DIR}${AIConstants.MODEL_FILENAME}`

let downloadResumable: FileSystem.DownloadResumable | null = null

/**
 * Checks if the local GGUF model file exists on the device.
 */
export const isModelDownloaded = async (): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH)
    return fileInfo.exists && !fileInfo.isDirectory && (fileInfo.size ?? 0) > 100 * 1024 * 1024
  } catch (error) {
    console.error('Error checking if model exists:', error)
    return false
  }
}

/**
 * Returns the absolute local file URI for the model.
 */
export const getModelPath = (): string => {
  return MODEL_PATH
}

/**
 * Ensures the models directory exists.
 */
const ensureDirectoryExists = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(MODELS_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MODELS_DIR, { intermediates: true })
  }
}

/**
 * Downloads the Qwen 1.5B GGUF model with progress reporting.
 * @param onProgress Callback receiving progress percentage (0 to 100).
 */
export const downloadModel = async (
  onProgress: (percent: number, downloadedMb: number, totalMb: number) => void
): Promise<string> => {
  await ensureDirectoryExists()

  const progressCallback: FileSystem.FileSystemNetworkTaskProgressCallback<FileSystem.DownloadProgressData> = (data) => {
    const totalBytes = data.totalBytesExpectedToWrite > 0 ? data.totalBytesExpectedToWrite : AIConstants.MODEL_SIZE_MB * 1024 * 1024
    const downloadedMb = Math.round((data.totalBytesWritten / (1024 * 1024)) * 10) / 10
    const totalMb = Math.round((totalBytes / (1024 * 1024)) * 10) / 10
    const percent = Math.min(100, Math.round((data.totalBytesWritten / totalBytes) * 100))
    onProgress(percent, downloadedMb, totalMb)
  }

  downloadResumable = FileSystem.createDownloadResumable(
    AIConstants.MODEL_DOWNLOAD_URL,
    MODEL_PATH,
    {},
    progressCallback
  )

  const result = await downloadResumable.downloadAsync()
  if (!result || !result.uri) {
    throw new Error('Model download failed: missing result URI')
  }

  return result.uri
}

/**
 * Cancels the current download if one is in progress.
 */
export const cancelDownload = async (): Promise<void> => {
  if (downloadResumable) {
    try {
      await downloadResumable.pauseAsync()
    } catch (e) {
      console.warn('Could not pause download:', e)
    }
    downloadResumable = null
  }
}

/**
 * Deletes the downloaded model file to free device storage.
 */
export const deleteModel = async (): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(MODEL_PATH)
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(MODEL_PATH, { idempotent: true })
    }
  } catch (error) {
    console.error('Error deleting model:', error)
  }
}
