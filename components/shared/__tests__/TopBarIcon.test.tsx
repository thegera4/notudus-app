import { renderTree, lastPressable, press } from '@/test-utils'
import TopBarIcon from '@/components/shared/TopBarIcon'

describe('components/shared/TopBarIcon', () => {
  it('renders and applies the shield style for the shield icon', () => {
    const onPress = jest.fn()
    const tree = renderTree(
      <TopBarIcon onPress={onPress} iconName="shield" size={24} color="white" />,
    )
    const style = lastPressable(tree).props.style
    expect(style({ pressed: false })).toEqual(expect.any(Object))
    expect(style({ pressed: true })).toEqual(expect.any(Object))
  })

  it('applies the pressed style for a regular icon', () => {
    const tree = renderTree(
      <TopBarIcon onPress={jest.fn()} iconName="search" size={24} color="white" />,
    )
    const style = lastPressable(tree).props.style
    expect(style({ pressed: false })).toBeFalsy()
    expect(style({ pressed: true })).toEqual(expect.any(Object))
  })

  it('applies the arrow back styles (pressed and unpressed)', () => {
    const tree = renderTree(
      <TopBarIcon onPress={jest.fn()} iconName="arrow-back" size={24} color="white" />,
    )
    const style = lastPressable(tree).props.style
    expect(style({ pressed: false })).toEqual(expect.any(Object))
    expect(style({ pressed: true })).toEqual([expect.any(Object), expect.any(Object)])
  })

  it('applies the shield style for the shield-outline icon and calls onPress', () => {
    const onPress = jest.fn()
    const tree = renderTree(
      <TopBarIcon onPress={onPress} iconName="shield-outline" size={24} color="white" />,
    )
    const style = lastPressable(tree).props.style
    expect(style({ pressed: false })).toEqual(expect.any(Object))

    press(lastPressable(tree))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
