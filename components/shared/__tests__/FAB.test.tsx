import { renderTree, lastPressable, press } from '@/test-utils'
import FAB from '@/components/shared/FAB'

describe('components/shared/FAB', () => {
  it('renders and calls onPress when pressed', () => {
    const onPress = jest.fn()
    const tree = renderTree(<FAB onPress={onPress} />)

    press(lastPressable(tree))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('applies the pressed style when the pressable is pressed', () => {
    const tree = renderTree(<FAB onPress={jest.fn()} />)
    const style = lastPressable(tree).props.style

    expect(style({ pressed: false })).toEqual([false, expect.any(Object)])
    expect(style({ pressed: true })).toEqual([expect.any(Object), expect.any(Object)])
  })
})
