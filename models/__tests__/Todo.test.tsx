jest.mock('@/utils/db', () => ({
  db: Promise.resolve({
    getAllAsync: jest.fn(),
    runAsync: jest.fn(),
  }),
}))

import { db } from '@/utils/db'
import Todo from '@/models/Todo'
import { Strings } from '@/constants/Strings'

const sampleTodo = new Todo('1', 'Buy milk', 0, '2026-01-01T00:00:00.000Z')

describe('models/Todo', () => {
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

  it('constructs a todo instance with the given fields', () => {
    const todo = new Todo('1', 'Buy milk', 0, '2026-01-01')
    expect(todo.id).toBe('1')
    expect(todo.todo).toBe('Buy milk')
    expect(todo.done).toBe(0)
    expect(todo.date).toBe('2026-01-01')
  })

  describe('insertTodo', () => {
    it('inserts a todo with the expected query and parameters', async () => {
      await Todo.insertTodo(sampleTodo)

      expect(runAsync).toHaveBeenCalledWith(
        'INSERT INTO todos (id, todo, done, date) VALUES (?, ?, ?, ?)',
        ['1', 'Buy milk', 0, '2026-01-01T00:00:00.000Z'],
      )
    })

    it('logs and swallows insert errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Todo.insertTodo(sampleTodo)

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.INSERT, expect.any(Error))
    })
  })

  describe('getTodos', () => {
    it('returns all todos', async () => {
      getAllAsync.mockResolvedValue([sampleTodo])
      const result = await Todo.getTodos()

      expect(getAllAsync).toHaveBeenCalledWith('SELECT * FROM todos')
      expect(result).toEqual([sampleTodo])
    })

    it('returns an empty array and logs when the query fails', async () => {
      getAllAsync.mockImplementation(() => { throw new Error('fail') })
      const result = await Todo.getTodos()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.GET, expect.any(Error))
    })
  })

  describe('deleteTodo', () => {
    it('deletes a todo by id', async () => {
      await Todo.deleteTodo('1')

      expect(runAsync).toHaveBeenCalledWith('DELETE FROM todos WHERE id = ?', ['1'])
    })

    it('logs and swallows delete errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Todo.deleteTodo('1')

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.DELETE, expect.any(Error))
    })
  })

  describe('updateTodo', () => {
    it('updates a todo', async () => {
      await Todo.updateTodo(sampleTodo)

      expect(runAsync).toHaveBeenCalledWith(
        'UPDATE todos SET todo = ?, done = ? WHERE id = ?',
        ['Buy milk', 0, '1'],
      )
    })

    it('logs and swallows update errors', async () => {
      runAsync.mockImplementation(() => { throw new Error('fail') })
      await Todo.updateTodo(sampleTodo)

      expect(console.error).toHaveBeenCalledWith(Strings.ERRORS.UPDATE, expect.any(Error))
    })
  })
})
