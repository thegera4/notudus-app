jest.mock('@/services/modelManagerService', () => ({
  isModelDownloaded: jest.fn(),
  downloadModel: jest.fn(),
}))

jest.mock('@/services/localLlamaService', () => ({
  queryLocalModel: jest.fn(),
}))

jest.mock('@/models/Note', () => ({
  __esModule: true,
  default: {
    getNotes: jest.fn(),
  },
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({ auth: false }),
}))

jest.mock('uuid', () => ({ __esModule: true, v4: () => 'mock-uuid' }))

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
import { renderTree, hasText } from '@/test-utils'
import AssistantScreen from '@/app/(tabs)/assistant'
import * as ModelManager from '@/services/modelManagerService'
import * as LocalLlama from '@/services/localLlamaService'
import Note from '@/models/Note'

describe('app/(tabs)/assistant', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows checking status initially and then renders downloader if model not downloaded', async () => {
    ;(ModelManager.isModelDownloaded as jest.Mock).mockResolvedValue(false)

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    expect(ModelManager.isModelDownloaded).toHaveBeenCalled()
    expect(hasText(tree, 'Asistente IA Local (100% Offline)')).toBe(true)
  })

  it('renders chat interface when model is ready', async () => {
    ;(ModelManager.isModelDownloaded as jest.Mock).mockResolvedValue(true)
    ;(Note.getNotes as jest.Mock).mockResolvedValue([
      { id: '1', title: 'Cuentas', content: 'Mama me debe $500', locked: 0, date: '2026-01-01' },
    ])

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    expect(hasText(tree, 'Assistant')).toBe(true)
  })

  it('triggers download when start download is called from downloader', async () => {
    ;(ModelManager.isModelDownloaded as jest.Mock).mockResolvedValue(false)
    ;(ModelManager.downloadModel as jest.Mock).mockImplementation(async (onProgress) => {
      onProgress(50, 493, 986)
      return 'file:///models/model.gguf'
    })

    let tree: any
    await act(async () => {
      tree = renderTree(<AssistantScreen />)
    })

    const downloader = tree.root.findByProps({ status: 'not_downloaded' })
    await act(async () => {
      await downloader.props.onStartDownload()
    })

    expect(ModelManager.downloadModel).toHaveBeenCalled()
  })
})
