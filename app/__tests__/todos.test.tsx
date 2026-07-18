jest.mock('@/hooks/useBottomSheet', () => ({
  __esModule: true,
  useBottomSheet: jest.fn(),
}))
jest.mock('@/models/Todo', () => ({
  __esModule: true,
  default: { deleteTodo: jest.fn(), updateTodo: jest.fn() },
}))
jest.mock('@/components/shared/TopBar', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/todos/TodoItem', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/shared/NoDataAnimation', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/shared/CustomLoading', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import { act } from 'react'
import { renderTree } from '@/test-utils'
import TodoScreen from '@/app/(tabs)/todos'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import Todo from '@/models/Todo'
import CustomLoading from '@/components/shared/CustomLoading'
import TopBar from '@/components/shared/TopBar'

const t1 = { id: '1', todo: 'First', done: 0, date: '2026-01-01T00:00:00.000Z' }
const t2 = { id: '2', todo: 'Second', done: 1, date: '2026-01-02T00:00:00.000Z' }
const makeTodos = () => [t1, t2]

function findFlatList(tree: any) {
  return tree.root.findAll(
    (n: any) =>
      n.props &&
      typeof n.props.renderItem === 'function' &&
      typeof n.props.keyExtractor === 'function',
  )[0]
}

describe('app/(tabs)/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Todo.deleteTodo as jest.Mock).mockResolvedValue(undefined)
    ;(Todo.updateTodo as jest.Mock).mockResolvedValue(undefined)
  })

  it('shows the loading screen while loading', () => {
    ;(useBottomSheet as jest.Mock).mockReturnValue({
      todos: [],
      setTodos: jest.fn(),
      screenIsLoading: true,
    })
    renderTree(<TodoScreen />)
    expect(CustomLoading).toHaveBeenCalledTimes(1)
  })

  it('renders the top bar and the list of todos when loaded', () => {
    const setTodos = jest.fn()
    ;(useBottomSheet as jest.Mock).mockReturnValue({
      todos: makeTodos(),
      setTodos,
      screenIsLoading: false,
    })
    const tree = renderTree(<TodoScreen />)
    expect(TopBar).toHaveBeenCalledTimes(1)
    const flatList = findFlatList(tree)
    expect(flatList.props.data).toHaveLength(2)
    expect(flatList.props.keyExtractor(t1)).toBe('1')
    expect(flatList.props.getItemLayout(null, 1)).toEqual({ length: 50, offset: 50, index: 1 })
  })

  it('deletes a todo through the rendered item onDelete handler', async () => {
    const setTodos = jest.fn()
    ;(useBottomSheet as jest.Mock).mockReturnValue({
      todos: makeTodos(),
      setTodos,
      screenIsLoading: false,
    })
    const tree = renderTree(<TodoScreen />)
    const item = findFlatList(tree).props.renderItem({ item: t1 })
    await act(async () => {
      item.props.onDelete('1')
    })
    expect(Todo.deleteTodo).toHaveBeenCalledWith('1')
    expect(setTodos).toHaveBeenCalledWith([t2])
  })

  it('updates a todo through the rendered item onUpdate handler', async () => {
    const setTodos = jest.fn()
    ;(useBottomSheet as jest.Mock).mockReturnValue({
      todos: makeTodos(),
      setTodos,
      screenIsLoading: false,
    })
    const tree = renderTree(<TodoScreen />)
    const updated = { ...t1, todo: 'Changed' }
    const item = findFlatList(tree).props.renderItem({ item: t1 })
    await act(async () => {
      item.props.onUpdate(updated)
    })
    expect(Todo.updateTodo).toHaveBeenCalledWith(updated)
    expect(setTodos).toHaveBeenCalledWith([t2, updated])
  })

  it('renders the empty state component', () => {
    ;(useBottomSheet as jest.Mock).mockReturnValue({
      todos: [],
      setTodos: jest.fn(),
      screenIsLoading: false,
    })
    const tree = renderTree(<TodoScreen />)
    const flatList = findFlatList(tree)
    expect(flatList.props.ListEmptyComponent).toBeDefined()
    // ListEmptyComponent is a NoDataAnimation element for the Todos screen
    expect(flatList.props.ListEmptyComponent.props.screen).toBe('Todos')
  })
})
