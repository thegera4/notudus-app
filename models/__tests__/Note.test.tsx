jest.mock('@/utils/db', () => ({
  db: Promise.resolve({
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  }),
}))

import { db } from '@/utils/db'
import Note from '@/models/Note'
import { Strings } from '@/constants/Strings'
import { NoteModelType } from '@/types'

const sampleNote: NoteModelType = {
  id: '1',
  title: 'Title',
  content: 'Content',
  locked: 0,
  date: '2026-01-01T00:00:00.000Z',
}

describe('models/Note', () => {
  let getAllAsync: jest.Mock
  let runAsync: jest.Mock

  beforeEach(async () => {
    const mockDb = await db
    getAllAsync = mockDb.getAllAsync as jest.Mock
    runAsync = mockDb.runAsync as jest.Mock
    getAllAsync.mockReset()
    runAsync.mockReset()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('constructs a note instance with the given fields', () => {
    const note = new Note('1', 'Title', 'Content', '2026-01-01', 0)
    expect(note.id).toBe('1')
    expect(note.title).toBe('Title')
    expect(note.content).toBe('Content')
    expect(note.date).toBe('2026-01-01')
    expect(note.locked).toBe(0)
  })

  describe('getNotes', () => {
    it('returns all notes when the user is authenticated', async () => {
      getAllAsync.mockResolvedValue([sampleNote])
      const result = await Note.getNotes(true)

      expect(getAllAsync).toHaveBeenCalledWith('SELECT * FROM notes')
      expect(result).toEqual([sampleNote])
    })

    it('returns only unlocked notes when the user is not authenticated', async () => {
      getAllAsync.mockResolvedValue([sampleNote])
      await Note.getNotes(false)

      expect(getAllAsync).toHaveBeenCalledWith('SELECT * FROM notes WHERE locked = 0')
    })

    it('returns an empty array and logs when the query fails', async () => {
      getAllAsync.mockImplementation(() => { throw new Error('fail') })
      const result = await Note.getNotes(true)

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.GET, expect.any(Error))
    })
  })

  describe('insertNote', () => {
    it('inserts a note with the expected query and parameters', async () => {
      await Note.insertNote(sampleNote)

      expect(runAsync).toHaveBeenCalledWith(
        'INSERT INTO notes (id, title, content, locked, date) VALUES (?, ?, ?, ?, ?)',
        ['1', 'Title', 'Content', 0, '2026-01-01T00:00:00.000Z'],
      )
    })

    it('logs and swallows insert errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Note.insertNote(sampleNote)

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.INSERT, expect.any(Error))
    })
  })

  describe('updateNote', () => {
    it('updates a note by id', async () => {
      await Note.updateNote('1', sampleNote)

      expect(runAsync).toHaveBeenCalledWith(
        'UPDATE notes SET title = ?, content = ?, locked = ?, date = ? WHERE id = ?',
        ['Title', 'Content', 0, '2026-01-01T00:00:00.000Z', '1'],
      )
    })

    it('logs and swallows update errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Note.updateNote('1', sampleNote)

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.UPDATE, expect.any(Error))
    })
  })

  describe('deleteNote', () => {
    it('deletes a note by id', async () => {
      await Note.deleteNote('1')

      expect(runAsync).toHaveBeenCalledWith('DELETE FROM notes WHERE id = ?', ['1'])
    })

    it('logs and swallows delete errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Note.deleteNote('1')

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.DELETE, expect.any(Error))
    })
  })
})
