import { Text } from 'react-native'
import { useContext } from 'react'
import { render, fireEvent, act } from '@testing-library/react-native'
import { AuthContext, AuthProvider } from '@/contexts/authContext'

const Consumer = () => {
  const { auth, setAuth } = useContext(AuthContext)
  return (
    <Text testID="value" onPress={() => setAuth(!auth)}>
      {`auth:${auth}`}
    </Text>
  )
}

describe('contexts/authContext', () => {
  it('exposes a default context value', () => {
    expect(AuthContext).toBeDefined()
    const { getByText } = render(<Consumer />)
    expect(getByText('auth:false')).toBeTruthy()
  })

  it('provides and updates the auth state to children', () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    expect(getByText('auth:false')).toBeTruthy()
    act(() => {
      fireEvent.press(getByTestId('value'))
    })
    expect(getByText('auth:true')).toBeTruthy()
  })
})
