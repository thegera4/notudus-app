jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      getAllAsync: jest.fn(),
      runAsync: jest.fn(),
    }),
  ),
}))

import { db, initDB } from '@/utils/db'
import * as SQLite from 'expo-sqlite'

describe('utils/db', () => {
  let mockDb: any

  beforeEach(async () => {
    mockDb = await db
    mockDb.execAsync.mockClear()
    mockDb.getAllAsync.mockClear()
    mockDb.runAsync.mockClear()
  })

  it('opens the notudus database', async () => {
    const opened = await db
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('notudus.db')
    expect(opened).toEqual(mockDb)
    expect(opened.execAsync).toBeDefined()
    expect(opened.getAllAsync).toBeDefined()
    expect(opened.runAsync).toBeDefined()
  })

  it('initDB creates the notes and todos tables', async () => {
    await initDB()

    expect(mockDb.execAsync).toHaveBeenCalledTimes(1)
    const callArg = mockDb.execAsync.mock.calls[0][0]
    expect(callArg).toContain('CREATE TABLE IF NOT EXISTS notes')
    expect(callArg).toContain('id TEXT PRIMARY KEY NOT NULL UNIQUE')
    expect(callArg).toContain('title TEXT')
    expect(callArg).toContain('content TEXT')
    expect(callArg).toContain('locked INTEGER NOT NULL')
    expect(callArg).toContain('date TEXT NOT NULL')
    expect(callArg).toContain('CREATE TABLE IF NOT EXISTS todos')
    expect(callArg).toContain('todo TEXT NOT NULL')
    expect(callArg).toContain('done INTEGER NOT NULL')
  })
})
