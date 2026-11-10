import AsyncStorage from '@react-native-async-storage/async-storage'
import { AIConstants } from '@/constants/AI'

export interface DailyUsageState {
  date: string
  count: number
  limit: number
  remaining: number
  isLimitReached: boolean
}

/**
 * Returns today's local date formatted as YYYY-MM-DD so the counter resets every midnight.
 */
export const getTodayDateString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Reads the current daily message count from AsyncStorage.
 * Automatically resets the count to 0 if the stored date is from a previous day.
 */
export const getDailyUsage = async (
  customLimit: number = AIConstants.MAX_DAILY_MESSAGES
): Promise<DailyUsageState> => {
  const today = getTodayDateString()
  let count = 0

  try {
    const raw = await AsyncStorage.getItem(AIConstants.DAILY_USAGE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.count === 'number') {
        const storedDate = String(parsed.date || '')
        const isClockRolledBack = storedDate > today
        if (storedDate === today || isClockRolledBack) {
          count = Math.max(0, parsed.count)
        }
      }
    }
  } catch (e) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('Error reading daily AI usage from storage:', e)
    }
  }

  const remaining = Math.max(0, customLimit - count)
  return {
    date: today,
    count,
    limit: customLimit,
    remaining,
    isLimitReached: count >= customLimit,
  }
}

/**
 * Returns true if the user has not yet reached the 10-messages-per-day limit.
 */
export const canSendMessage = async (
  customLimit: number = AIConstants.MAX_DAILY_MESSAGES
): Promise<boolean> => {
  const usage = await getDailyUsage(customLimit)
  return !usage.isLimitReached
}

/**
 * Increments today's message counter by 1 and persists it in AsyncStorage.
 */
export const incrementDailyUsage = async (
  customLimit: number = AIConstants.MAX_DAILY_MESSAGES
): Promise<DailyUsageState> => {
  const current = await getDailyUsage(customLimit)
  const newCount = current.count + 1
  const today = current.date

  try {
    await AsyncStorage.setItem(
      AIConstants.DAILY_USAGE_STORAGE_KEY,
      JSON.stringify({ date: today, count: newCount })
    )
  } catch (e) {
    console.warn('Error saving daily AI usage to storage:', e)
  }

  const remaining = Math.max(0, customLimit - newCount)
  return {
    date: today,
    count: newCount,
    limit: customLimit,
    remaining,
    isLimitReached: newCount >= customLimit,
  }
}

/**
 * Resets today's message counter back to 0 in AsyncStorage.
 */
export const resetDailyUsage = async (
  customLimit: number = AIConstants.MAX_DAILY_MESSAGES
): Promise<DailyUsageState> => {
  const today = getTodayDateString()
  try {
    await AsyncStorage.setItem(
      AIConstants.DAILY_USAGE_STORAGE_KEY,
      JSON.stringify({ date: today, count: 0 })
    )
  } catch (e) {
    console.warn('Error resetting daily AI usage in storage:', e)
  }

  return {
    date: today,
    count: 0,
    limit: customLimit,
    remaining: customLimit,
    isLimitReached: false,
  }
}

