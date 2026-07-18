jest.mock('@/utils/animations', () => ({
  fadeIn: jest.fn(),
}))

import { render } from '@testing-library/react-native'
import { fadeIn } from '@/utils/animations'
import CustomLoading from '@/components/shared/CustomLoading'

describe('components/shared/CustomLoading', () => {
  beforeEach(() => {
    ;(fadeIn as jest.Mock).mockClear()
  })

  it('renders the skeleton loading screen and starts the fade animation', () => {
    render(<CustomLoading />)

    expect(fadeIn).toHaveBeenCalledTimes(1)
  })
})
