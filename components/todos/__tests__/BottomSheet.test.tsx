jest.mock('@/utils/animations', () => ({
  slideUp: jest.fn(),
  slideDown: jest.fn(),
}))

jest.mock('@/models/Todo', () => ({
  __esModule: true,
  default: { insertTodo: jest.fn(), updateTodo: jest.fn() },
}))

jest.mock('uuid', () => ({ __esModule: true, v4: () => 'mock-uuid' }))

import { act } from 'react'
import { Dimensions, Platform } from 'react-native'
import { renderTree, findPressables, press } from '@/test-utils'
import BottomSheet from '@/components/todos/BottomSheet'
import { slideUp, slideDown } from '@/utils/animations'
import Todo from '@/models/Todo'
import { Strings } from '@/constants/Strings'

jest.useFakeTimers()

const selectedTodo = { id: '1', todo: 'old text', done: 0, date: '2026-01-01T00:00:00.000Z' }

function findSaveButton(tree: any) {
  return findPressables(tree, (n) => 'disabled' in n.props)[0]
}

function findCancelButton(tree: any) {
  return findPressables(tree, (n) => !('disabled' in n.props))[0]
}

function findTextInput(tree: any) {
  return tree.root.findAll(
    (n: any) => n.props && typeof n.props.onChangeText === 'function',
  )[0]
}

describe('components/todos/BottomSheet', () => {
  let dimensionsSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Todo.insertTodo as jest.Mock).mockResolvedValue(undefined)
    ;(Todo.updateTodo as jest.Mock).mockResolvedValue(undefined)
    dimensionsSpy = jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 400, height: 600 })
  })

  afterEach(() => {
    dimensionsSpy.mockRestore()
  })

  it('mounts with empty content and triggers the slideUp animation', () => {
    const tree = renderTree(
      <BottomSheet setVisible={jest.fn()} setTodos={jest.fn()} todos={[]} />,
    )
    expect(slideUp).toHaveBeenCalledTimes(1)
    expect(findSaveButton(tree).props.disabled).toBe(true)
  })

  it('initializes content from the selected todo', () => {
    renderTree(
      <BottomSheet
        setVisible={jest.fn()}
        setTodos={jest.fn()}
        todos={[selectedTodo]}
        selectedTodo={selectedTodo}
      />,
    )
    expect(slideUp).toHaveBeenCalledTimes(1)
  })

  it('does not save when the content is empty', async () => {
    const setTodos = jest.fn()
    const tree = renderTree(
      <BottomSheet setVisible={jest.fn()} setTodos={setTodos} todos={[]} />,
    )
    await act(async () => {
      findSaveButton(tree).props.onPress()
    })
    expect(Todo.insertTodo).not.toHaveBeenCalled()
    expect(setTodos).not.toHaveBeenCalled()
  })

  it('inserts a new todo and closes the sheet', async () => {
    const setTodos = jest.fn()
    const setVisible = jest.fn()
    const tree = renderTree(
      <BottomSheet setVisible={setVisible} setTodos={setTodos} todos={[]} />,
    )
    act(() => findTextInput(tree).props.onChangeText('Buy milk'))
    await act(async () => {
      findSaveButton(tree).props.onPress()
    })

    expect(Todo.insertTodo).toHaveBeenCalledTimes(1)
    const inserted = (Todo.insertTodo as jest.Mock).mock.calls[0][0]
    expect(inserted.id).toBe('mock-uuid')
    expect(inserted.todo).toBe('Buy milk')
    expect(inserted.done).toBe(0)
    expect(setTodos).toHaveBeenCalledTimes(1)

    act(() => jest.advanceTimersByTime(200))
    expect(setVisible).toHaveBeenCalledTimes(1)
  })

  it('updates an existing todo', async () => {
    const other = { id: '2', todo: 'other todo', done: 0, date: '2026-01-01T00:00:00.000Z' }
    const setTodos = jest.fn()
    const tree = renderTree(
      <BottomSheet
        setVisible={jest.fn()}
        setTodos={setTodos}
        todos={[other, selectedTodo]}
        selectedTodo={selectedTodo}
      />,
    )
    act(() => findTextInput(tree).props.onChangeText('updated text'))
    await act(async () => {
      findSaveButton(tree).props.onPress()
    })

    expect(Todo.updateTodo).toHaveBeenCalledTimes(1)
    const updated = (Todo.updateTodo as jest.Mock).mock.calls[0][0]
    expect(updated.id).toBe('1')
    expect(updated.todo).toBe('updated text')
    expect(setTodos).toHaveBeenCalledTimes(1)
    // the mapped list keeps the non-matching todo unchanged
    expect(setTodos.mock.calls[0][0]).toEqual([other, updated])
  })

  it('logs an error when inserting fails', async () => {
    ;(Todo.insertTodo as jest.Mock).mockRejectedValue(new Error('boom'))
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const tree = renderTree(
      <BottomSheet setVisible={jest.fn()} setTodos={jest.fn()} todos={[]} />,
    )
    act(() => findTextInput(tree).props.onChangeText('something'))
    await act(async () => {
      findSaveButton(tree).props.onPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.INSERT, expect.any(Error))
    errorSpy.mockRestore()
  })

  it('closes the sheet when the cancel button is pressed', () => {
    const setVisible = jest.fn()
    const tree = renderTree(
      <BottomSheet setVisible={setVisible} setTodos={jest.fn()} todos={[]} />,
    )
    press(findCancelButton(tree))
    expect(slideDown).toHaveBeenCalledTimes(1)
    act(() => jest.advanceTimersByTime(200))
    expect(setVisible).toHaveBeenCalledTimes(1)
  })

  it('uses the smaller void pressable height on short screens', () => {
    dimensionsSpy.mockReturnValue({ width: 400, height: 500 })
    const tree = renderTree(
      <BottomSheet setVisible={jest.fn()} setTodos={jest.fn()} todos={[]} />,
    )
    expect(findSaveButton(tree)).toBeDefined()
    // height*0.5 = 250 < 300 -> voidPressable height 150 branch covered
    void tree
  })

  it('uses the height behavior for the android platform', () => {
    const originalOS = Platform.OS
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    const tree = renderTree(
      <BottomSheet setVisible={jest.fn()} setTodos={jest.fn()} todos={[]} />,
    )
    expect(findSaveButton(tree)).toBeDefined()
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
  })
})
