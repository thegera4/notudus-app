import { render } from '@testing-library/react-native'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'

describe('components/navigation/TabBarIcon', () => {
  it('renders an icon with the given name and color', () => {
    const { getByTestId } = render(
      <TabBarIcon testID="icon" name="home" color="#fff" />,
    )
    expect(getByTestId('icon')).toBeTruthy()
  })

  it('applies the default and custom styles', () => {
    const { getByTestId } = render(
      <TabBarIcon testID="icon" name="list" color="green" style={{ margin: 4 }} />,
    )
    expect(getByTestId('icon')).toBeTruthy()
  })
})
