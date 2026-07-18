import { Animated, Easing } from 'react-native'
import {
  animateListItem,
  slideAnimation,
  fadeIn,
  slideUp,
  slideDown,
} from '@/utils/animations'

describe('utils/animations', () => {
  let startMock: jest.Mock
  let timingSpy: jest.SpyInstance

  beforeEach(() => {
    startMock = jest.fn()
    timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({
      start: startMock,
    } as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('animateListItem starts a timing to 1', () => {
    const ref = new Animated.Value(0) as any
    animateListItem(ref)

    expect(Animated.timing).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    )
    expect(typeof timingSpy.mock.calls[0][1].easing).toBe('function')
    expect(startMock).toHaveBeenCalledTimes(1)
  })

  it('slideAnimation starts a timing and calls onDelete on completion', () => {
    const ref = new Animated.Value(0) as any
    const onDelete = jest.fn()
    slideAnimation(ref, onDelete)

    expect(Animated.timing).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ toValue: -500, duration: 300, useNativeDriver: true }),
    )
    expect(startMock).toHaveBeenCalledTimes(1)
    startMock.mock.calls[0][0]()
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('slideUp starts a timing to 0', () => {
    const ref = new Animated.Value(300) as any
    slideUp(ref)

    expect(Animated.timing).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ toValue: 0, duration: 200, useNativeDriver: true }),
    )
    expect(startMock).toHaveBeenCalledTimes(1)
  })

  it('slideDown starts a timing to 300', () => {
    const ref = new Animated.Value(0) as any
    slideDown(ref)

    expect(Animated.timing).toHaveBeenCalledWith(
      ref,
      expect.objectContaining({ toValue: 300, duration: 200, useNativeDriver: true }),
    )
    expect(startMock).toHaveBeenCalledTimes(1)
  })

  it('fadeIn calls timing and chains into fadeOut on completion', () => {
    const ref = new Animated.Value(0) as any
    fadeIn(ref)

    // first timing: fadeIn to 1
    expect(Animated.timing).toHaveBeenLastCalledWith(
      ref,
      expect.objectContaining({ toValue: 1, duration: 1000, useNativeDriver: true }),
    )

    // complete fadeIn -> should trigger fadeOut (toValue 0.5)
    startMock.mock.calls[0][0]()

    expect(Animated.timing).toHaveBeenLastCalledWith(
      ref,
      expect.objectContaining({ toValue: 0.5, duration: 1000, useNativeDriver: true }),
    )

    // complete fadeOut -> triggers fadeIn again (covers the recursive callback)
    startMock.mock.calls[1][0]()

    expect(Animated.timing).toHaveBeenLastCalledWith(
      ref,
      expect.objectContaining({ toValue: 1, duration: 1000, useNativeDriver: true }),
    )
  })
})
