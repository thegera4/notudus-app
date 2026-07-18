jest.mock('expo-router', () => {
  const React = require('react')
  const Tabs = jest.fn(({ children }: any) =>
    React.createElement(React.Fragment, null, children),
  )
  const Screen = jest.fn(() => null)
  ;(Tabs as any).Screen = Screen
  return { Tabs, router: { navigate: jest.fn() }, usePathname: jest.fn() }
})

jest.mock('@/components/navigation/TabBarIcon', () => ({
  TabBarIcon: jest.fn(() => null),
}))
jest.mock('@/components/shared/FAB', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))
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

import { renderTree } from '@/test-utils'
import { Tabs, router, usePathname } from 'expo-router'
import FAB from '@/components/shared/FAB'
import { addNoteRoute } from '@/constants/Routes'

const { __openBottomSheet } = require('@/hooks/useBottomSheet') as {
  __openBottomSheet: jest.Mock
}

const TabsMock = Tabs as unknown as jest.Mock
const FABMock = FAB as unknown as jest.Mock

describe('app/(tabs)/_layout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('navigates to addNote when the FAB is pressed on the Notes tab', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    renderTree(require('@/app/(tabs)/_layout').default())
    FABMock.mock.calls[0][0].onPress()
    expect(router.navigate).toHaveBeenCalledWith(addNoteRoute)
  })

  it('opens the bottom sheet when the FAB is pressed on the Todos tab', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/todos')
    renderTree(require('@/app/(tabs)/_layout').default())
    FABMock.mock.calls[0][0].onPress()
    expect(__openBottomSheet).toHaveBeenCalledTimes(1)
    expect(router.navigate).not.toHaveBeenCalled()
  })

  it('renders the tab icons for both tabs (focused and unfocused)', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/')
    renderTree(require('@/app/(tabs)/_layout').default())

    const screenCalls = (TabsMock as any).Screen.mock.calls
    const indexOptions = screenCalls[0][0].options
    const todosOptions = screenCalls[1][0].options

    indexOptions.tabBarIcon({ color: 'green', focused: true })
    indexOptions.tabBarIcon({ color: 'green', focused: false })
    todosOptions.tabBarIcon({ color: 'green', focused: true })
    todosOptions.tabBarIcon({ color: 'green', focused: false })

    expect(indexOptions.title).toBe('Notes')
    expect(todosOptions.title).toBe('Todos')
  })
})
