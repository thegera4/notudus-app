jest.mock('lottie-react-native', () => 'LottieView')

import { render } from '@testing-library/react-native'
import NoDataAnimation from '@/components/shared/NoDataAnimation'

describe('components/shared/NoDataAnimation', () => {
  it('renders the empty-state message for the given screen', () => {
    const { getByText } = render(<NoDataAnimation screen="Notes" />)
    expect(
      getByText('No Notes! Add new Notes with the + button.'),
    ).toBeTruthy()
  })

  it('renders the empty-state message for the Todos screen', () => {
    const { getByText } = render(<NoDataAnimation screen="ToDos" />)
    expect(
      getByText('No ToDos! Add new ToDos with the + button.'),
    ).toBeTruthy()
  })
})
