jest.mock('@/hooks/useBottomSheet', () => {
  const openBottomSheet = jest.fn()
  return {
    __esModule: true,
    __openBottomSheet: openBottomSheet,
    useBottomSheet: () => ({
      openBottomSheet,
      todos: [],
      setTodos: jest.fn(),
      screenIsLoading: false,
    }),
  }
})

jest.mock('@/utils/animations', () => ({
  slideAnimation: jest.fn((_ref: any, cb: any) => cb()),
  animateListItem: jest.fn(),
}))

jest.mock('@/models/Todo', () => ({ __esModule: true, default: {} }))

jest.mock('react-native-gesture-handler', () => {
  const React = require('react')
  const Swipeable = jest.fn(({ children }: any) => children)
  return { __esModule: true, Swipeable, GestureHandlerRootView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import { act } from 'react'
import { renderTree, rerenderTree, findPressables, press, hasText } from '@/test-utils'
import { Swipeable } from 'react-native-gesture-handler'
import TodoItem from '@/components/todos/TodoItem'
import { slideAnimation, animateListItem } from '@/utils/animations'
import { Strings } from '@/constants/Strings'

const { __openBottomSheet } = require('@/hooks/useBottomSheet') as {
  __openBottomSheet: jest.Mock
}

const SwipeableMock = Swipeable as unknown as jest.Mock

const todo = { id: '1', todo: 'Buy milk', done: 0, date: '2026-01-01T00:00:00.000Z' }

describe('components/todos/TodoItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    __openBottomSheet.mockClear()
  })

  it('renders the todo text and starts the entrance animation', () => {
    const tree = renderTree(
      <TodoItem todo={todo} onDelete={jest.fn()} onUpdate={jest.fn()} />,
    )
    expect(hasText(tree, 'Buy milk')).toBe(true)
    expect(animateListItem).toHaveBeenCalledTimes(1)
  })

  it('renders a completed todo with the done styling', () => {
    const tree = renderTree(
      <TodoItem
        todo={{ ...todo, done: 1 }}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />,
    )
    expect(hasText(tree, 'Buy milk')).toBe(true)
  })

  it('toggles the done status to 1 when an incomplete todo is tapped', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined)
    const tree = renderTree(<TodoItem todo={todo} onDelete={jest.fn()} onUpdate={onUpdate} />)
    await act(async () => {
      findPressables(tree)[0].props.onPress()
    })
    expect(onUpdate).toHaveBeenCalledWith({ ...todo, done: 1 })
  })

  it('toggles the done status to 0 when a completed todo is tapped', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined)
    const tree = renderTree(
      <TodoItem todo={{ ...todo, done: 1 }} onDelete={jest.fn()} onUpdate={onUpdate} />,
    )
    await act(async () => {
      findPressables(tree)[0].props.onPress()
    })
    expect(onUpdate).toHaveBeenCalledWith({ ...todo, done: 0 })
  })

  it('logs an error when updating fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const onUpdate = jest.fn().mockRejectedValue(new Error('boom'))
    const tree = renderTree(<TodoItem todo={todo} onDelete={jest.fn()} onUpdate={onUpdate} />)
    await act(async () => {
      findPressables(tree)[0].props.onPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.UPDATE, expect.any(Error))
    errorSpy.mockRestore()
  })

  it('deletes the todo via the right swipe action', () => {
    const onDelete = jest.fn()
    const tree = renderTree(<TodoItem todo={todo} onDelete={onDelete} onUpdate={jest.fn()} />)
    const { renderRightActions } = SwipeableMock.mock.calls[0][0]

    const rightTree = renderTree(renderRightActions())
    press(findPressables(rightTree)[0])

    expect(slideAnimation).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('opens the bottom sheet via the left swipe action', () => {
    renderTree(<TodoItem todo={todo} onDelete={jest.fn()} onUpdate={jest.fn()} />)
    const { renderLeftActions } = SwipeableMock.mock.calls[0][0]

    const leftTree = renderTree(renderLeftActions())
    press(findPressables(leftTree)[0])

    expect(__openBottomSheet).toHaveBeenCalledWith(todo)
  })

  it('updates the current todo when the todo prop changes', () => {
    const tree = renderTree(<TodoItem todo={todo} onDelete={jest.fn()} onUpdate={jest.fn()} />)
    rerenderTree(
      tree,
      <TodoItem
        todo={{ ...todo, todo: 'Changed' }}
        onDelete={jest.fn()}
        onUpdate={jest.fn()}
      />,
    )
    expect(hasText(tree, 'Changed')).toBe(true)
  })
})
