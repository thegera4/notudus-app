jest.mock('@/components/todos/BottomSheet', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

jest.mock('@/models/Todo', () => ({
  __esModule: true,
  default: { getTodos: jest.fn().mockResolvedValue([]) },
}))

import { Text } from 'react-native'
import { useEffect } from 'react'
import { render } from '@testing-library/react-native'
import { useBottomSheet } from '@/hooks/useBottomSheet'

const Consumer = () => {
  const { todos, screenIsLoading, openBottomSheet, setTodos } = useBottomSheet()

  // exercise the default no-op callbacks
  useEffect(() => {
    openBottomSheet()
    setTodos([])
  }, [openBottomSheet, setTodos])

  return (
    <Text>
      {`todos:${todos.length},loading:${screenIsLoading},open:${typeof openBottomSheet},set:${typeof setTodos}`}
    </Text>
  )
}

describe('hooks/useBottomSheet', () => {
  it('returns the default context value when used outside a provider', () => {
    const { getByText } = render(<Consumer />)
    expect(
      getByText('todos:0,loading:false,open:function,set:function'),
    ).toBeTruthy()
  })
})
