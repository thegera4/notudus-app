import { render } from '@testing-library/react-native'
import PrivateText from '@/components/notes/PrivateText'

describe('components/notes/PrivateText', () => {
  it('renders the word Private', () => {
    const { getByText } = render(<PrivateText />)
    expect(getByText('Private')).toBeTruthy()
  })
})
