import { useEffect, useRef }from 'react'
import { View, Text, StyleSheet } from 'react-native'
import LottieView from 'lottie-react-native'
import * as emptyAnimation from '@/assets/animations/empty.json'
import { NoDataAnimationProps } from '@/types';

export default function NoDataAnimation ({ screen }: NoDataAnimationProps) {

  const animation = useRef<LottieView>(null);

  useEffect(() => { animation.current?.play() }, [])

  return (
    <View style={styles.animationContainer}>
      <LottieView ref={animation} source={emptyAnimation} autoPlay loop={false} style={styles.animation}/>
      <Text style={styles.emptyText}>{`No ${screen}! Add new ${screen} with the + button.`}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  animationContainer: { flex: 1, alignItems: 'center', marginTop: 80 },
  animation: { width: 200, height: 200, alignSelf: 'center' },
  emptyText: { color: 'white', fontSize: 16, textAlign: 'center' },
})