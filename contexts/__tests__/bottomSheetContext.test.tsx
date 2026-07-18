jest.mock('@/components/todos/BottomSheet', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('@/models/Todo', () => ({
  __esModule: true,
  default: { getTodos: jest.fn() },
}))

import { Pressable, Text } from 'react-native'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { BottomSheetProvider } from '@/contexts/bottomSheetContext'
import BottomSheet from '@/components/todos/BottomSheet'
import Todo from '@/models/Todo'
import { Strings } from '@/constants/Strings'
import { useBottomSheet } from '@/hooks/useBottomSheet'

const Consumer = () => {
  const { todos, screenIsLoading, openBottomSheet } = useBottomSheet()
  return (
    <>
      <Text>{`count:${todos.length},loading:${screenIsLoading}`}</Text>
      <Text>{`first:${todos[0]?.date ?? 'none'}`}</Text>
      <Pressable testID="open" onPress={() => openBottomSheet(todos[0] ?? undefined)}>
        <Text>open</Text>
      </Pressable>
      <Pressable testID="openDefault" onPress={() => openBottomSheet()}>
        <Text>openDefault</Text>
      </Pressable>
    </>
  )
}

const BottomSheetMock = BottomSheet as unknown as jest.Mock

describe('contexts/bottomSheetContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    BottomSheetMock.mockClear()
  })

  it('fetches, sorts todos by date descending and stops loading', async () => {
    ;(Todo.getTodos as jest.Mock).mockResolvedValue([
      { id: 'a', todo: 'old', done: 0, date: '2026-01-01T00:00:00.000Z' },
      { id: 'b', todo: 'new', done: 0, date: '2026-01-02T00:00:00.000Z' },
    ])

    const { getByText } = render(
      <BottomSheetProvider>
        <Consumer />
      </BottomSheetProvider>,
    )

    await waitFor(() => expect(getByText('count:2,loading:false')).toBeTruthy())
    expect(getByText('first:2026-01-02T00:00:00.000Z')).toBeTruthy()
    // BottomSheet is not rendered until opened
    expect(BottomSheetMock).not.toHaveBeenCalled()
  })

  it('logs and stops loading when fetching todos fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(Todo.getTodos as jest.Mock).mockRejectedValue(new Error('boom'))

    const { getByText } = render(
      <BottomSheetProvider>
        <Consumer />
      </BottomSheetProvider>,
    )

    await waitFor(() => expect(getByText('count:0,loading:false')).toBeTruthy())
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.GET, expect.any(Error))
    errorSpy.mockRestore()
  })

  it('opens the bottom sheet with the selected todo', async () => {
    const todo = { id: 'b', todo: 'new', done: 0, date: '2026-01-02T00:00:00.000Z' }
    ;(Todo.getTodos as jest.Mock).mockResolvedValue([todo])

    const { getByText, getByTestId } = render(
      <BottomSheetProvider>
        <Consumer />
      </BottomSheetProvider>,
    )

    await waitFor(() => expect(getByText('count:1,loading:false')).toBeTruthy())
    fireEvent.press(getByTestId('open'))

    expect(BottomSheetMock).toHaveBeenCalledTimes(1)
    const props = BottomSheetMock.mock.calls[0][0]
    expect(props.selectedTodo).toEqual(todo)
    expect(typeof props.setVisible).toBe('function')
    expect(typeof props.setTodos).toBe('function')

    // calling setVisible toggles visibility and unmounts the bottom sheet
    const callsBefore = BottomSheetMock.mock.calls.length
    act(() => props.setVisible())
    expect(BottomSheetMock.mock.calls.length).toBe(callsBefore)
  })

  it('opens the bottom sheet without a selected todo (default param)', async () => {
    ;(Todo.getTodos as jest.Mock).mockResolvedValue([])

    const { getByText, getByTestId } = render(
      <BottomSheetProvider>
        <Consumer />
      </BottomSheetProvider>,
    )

    await waitFor(() => expect(getByText('count:0,loading:false')).toBeTruthy())
    fireEvent.press(getByTestId('openDefault'))

    expect(BottomSheetMock).toHaveBeenCalledTimes(1)
    expect(BottomSheetMock.mock.calls[0][0].selectedTodo).toBeNull()
  })
})
