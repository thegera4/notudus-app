jest.mock('expo-font', () => ({ useFonts: jest.fn(() => [true]) }))
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}))
jest.mock('@/utils/db', () => ({ initDB: jest.fn() }))
jest.mock('expo-router', () => {
  const React = require('react')
  const Stack = jest.fn(({ children }: any) => React.createElement(React.Fragment, null, children))
  ;(Stack as any).Screen = () => null
  return { Stack }
})
jest.mock('@/contexts/authContext', () => ({
  AuthProvider: ({ children }: any) => children,
}))
jest.mock('@/contexts/bottomSheetContext', () => ({
  BottomSheetProvider: ({ children }: any) => children,
}))
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
}))
jest.mock('react-native-reanimated', () => ({}))
jest.mock('react-native-get-random-values', () => ({}))
jest.mock('@react-navigation/native', () => ({
  DarkTheme: {},
  ThemeProvider: ({ children }: any) => children,
}))

import { act } from 'react'
import { renderTree } from '@/test-utils'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { initDB } from '@/utils/db'
import RootLayout from '@/app/_layout'

describe('app/_layout (root)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFonts as jest.Mock).mockReturnValue([true])
  })

  it('renders the providers and stack when fonts are loaded and hides the splash screen', () => {
    const tree = renderTree(<RootLayout />)
    expect(initDB).toHaveBeenCalledTimes(1)
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1)
    // the tree renders (not null)
    expect(tree.root.findAll(() => true).length).toBeGreaterThan(0)
  })

  it('renders null and does not hide the splash screen while fonts are loading', () => {
    ;(useFonts as jest.Mock).mockReturnValue([false])
    const tree = renderTree(<RootLayout />)
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled()
    expect(tree.toJSON()).toBeNull()
  })

  it('initializes the database on mount', () => {
    renderTree(<RootLayout />)
    expect(initDB).toHaveBeenCalled()
  })
})
