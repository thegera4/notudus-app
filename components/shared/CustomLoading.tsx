import { fadeIn } from '@/utils/animations'
import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

export default function CustomLoading() {

  const fadeAnim = useRef(new Animated.Value(0)).current

  // Creates a continuous fade in and out animation for the loading screen
  useEffect(() => { fadeIn(fadeAnim) }, [fadeAnim])

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Animated.View style={[styles.screenName, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.icons, { opacity: fadeAnim }]} />
      </View>
      {[...Array(8)].map((_, i) => (
        <Animated.View key={i} style={[styles.Item, { opacity: fadeAnim }]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between' },
  screenName: {
    width: 120,
    height: 30,
    backgroundColor: '#303030',
    marginBottom: 20,
    marginLeft: 10,
    borderRadius: 10,
  },
  icons: {
    width: 100,
    height: 30,
    backgroundColor: '#303030',
    marginRight: 10,
    borderRadius: 10,
  },
  Item: {
    width: '94%',
    height: 110,
    backgroundColor: '#303030',
    marginBottom: 10,
    marginLeft: 10,
    borderRadius: 10,
  },
})