import { Pressable, Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'
import { useAuth } from '@/hooks/useAuth'
import { AuthProvider } from '@/contexts/authContext'

const Consumer = () => {
  const { auth, setAuth } = useAuth()
  return (
    <>
      <Text>{`auth:${auth}`}</Text>
      <Pressable testID="toggle" onPress={() => setAuth(!auth)}>
        <Text>toggle</Text>
      </Pressable>
    </>
  )
}

describe('hooks/useAuth', () => {
  it('returns the default context value when used outside a provider', () => {
    const { getByText, getByTestId } = render(<Consumer />)

    expect(getByText('auth:false')).toBeTruthy()
    // default setAuth is a no-op, so toggling changes nothing
    fireEvent.press(getByTestId('toggle'))
    expect(getByText('auth:false')).toBeTruthy()
  })

  it('returns the provider value and toggles auth when inside a provider', () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    expect(getByText('auth:false')).toBeTruthy()
    fireEvent.press(getByTestId('toggle'))
    expect(getByText('auth:true')).toBeTruthy()
    fireEvent.press(getByTestId('toggle'))
    expect(getByText('auth:false')).toBeTruthy()
  })
})
