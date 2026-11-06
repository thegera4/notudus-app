import {
  syncRemoteModelConfig,
  getActiveCloudModelParams,
} from '@/services/modelManagerService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AIConstants } from '@/constants/AI'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}))

describe('services/modelManagerService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves default active cloud model parameters from AIConstants', async () => {
    const params = await getActiveCloudModelParams()
    expect(params.baseURL).toBe(AIConstants.API_BASE_URL)
    expect(params.modelString).toBe(AIConstants.MODEL)
    expect(params.dailyLimit).toBe(AIConstants.MAX_DAILY_MESSAGES)
  })

  it('applies cached remote configuration overrides when present in AsyncStorage', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        baseURL: 'https://ai-gateway.vercel.sh/v1',
        model: 'nvidia/nemotron-3.5-lightning-free',
        dailyLimit: 15,
      })
    )

    await syncRemoteModelConfig('')
    const params = await getActiveCloudModelParams()
    expect(params.modelString).toBe('nvidia/nemotron-3.5-lightning-free')
    expect(params.dailyLimit).toBe(15)
  })
})
