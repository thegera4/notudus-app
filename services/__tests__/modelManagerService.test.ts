import {
  isModelDownloaded,
  getModelPath,
  downloadModel,
  deleteModel,
} from '@/services/modelManagerService'
import * as FileSystem from 'expo-file-system'

jest.mock('expo-file-system', () => {
  const downloadAsync = jest.fn().mockResolvedValue({ uri: '/mock/models/model.gguf' })
  return {
    documentDirectory: '/mock/documents/',
    getInfoAsync: jest.fn(),
    makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
    createDownloadResumable: jest.fn().mockImplementation((_url, _path, _opts, callback) => ({
      downloadAsync: async () => {
        if (callback) {
          callback({ totalBytesWritten: 500, totalBytesExpectedToWrite: 1000 })
        }
        return downloadAsync()
      },
      pauseAsync: jest.fn().mockResolvedValue(undefined),
    })),
    deleteAsync: jest.fn().mockResolvedValue(undefined),
  }
})

describe('services/modelManagerService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns model path pointing to documentDirectory/models', () => {
    const path = getModelPath()
    expect(path).toContain('/mock/documents/models/qwen2.5-1.5b-instruct-q4_k_m.gguf')
  })

  it('checks if model is downloaded and returns true when file exists and size is valid', async () => {
    ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: true,
      isDirectory: false,
      size: 500 * 1024 * 1024,
    })

    const downloaded = await isModelDownloaded()
    expect(downloaded).toBe(true)
  })

  it('returns false when model file does not exist or size is 0', async () => {
    ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: false,
    })

    const downloaded = await isModelDownloaded()
    expect(downloaded).toBe(false)
  })

  it('downloads model and reports progress', async () => {
    ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })
    const onProgress = jest.fn()

    const uri = await downloadModel(onProgress)
    expect(uri).toBe('/mock/models/model.gguf')
    expect(onProgress).toHaveBeenCalledWith(50, expect.any(Number), expect.any(Number))
  })

  it('deletes model file if it exists', async () => {
    ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true })

    await deleteModel()
    expect(FileSystem.deleteAsync).toHaveBeenCalled()
  })
})
