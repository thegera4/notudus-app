import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getTodayDateString,
  getDailyUsage,
  canSendMessage,
  incrementDailyUsage,
} from '@/services/usageLimitService'

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))

describe('services/usageLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 0 count and 10 remaining when no usage is stored', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)

    const usage = await getDailyUsage()
    expect(usage.count).toBe(0)
    expect(usage.limit).toBe(10)
    expect(usage.remaining).toBe(10)
    expect(usage.isLimitReached).toBe(false)
  })

  it('resets count to 0 if stored date is from a previous day', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ date: '2020-01-01', count: 10 })
    )

    const usage = await getDailyUsage()
    expect(usage.count).toBe(0)
    expect(usage.isLimitReached).toBe(false)
  })

  it('increments today count and blocks when reaching 10 messages', async () => {
    const today = getTodayDateString()
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ date: today, count: 9 })
    )

    const canSendBefore = await canSendMessage()
    expect(canSendBefore).toBe(true)

    const updated = await incrementDailyUsage()
    expect(updated.count).toBe(10)
    expect(updated.remaining).toBe(0)
    expect(updated.isLimitReached).toBe(true)
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'notudus_ai_daily_usage',
      JSON.stringify({ date: today, count: 10 })
    )
  })
})

