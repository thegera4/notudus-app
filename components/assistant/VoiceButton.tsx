import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSpeechRecognitionEvent } from 'expo-speech-recognition'
import {
  startOfflineListening,
  stopOfflineListening,
  requestVoicePermissions,
} from '@/services/offlineVoiceService'
import { VoiceButtonProps } from '@/types'
import { Strings } from '@/constants/Strings'

export default function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null
    if (isListening) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      )
      animation.start()
    } else {
      pulseAnim.setValue(1)
    }

    return () => {
      if (animation) animation.stop()
    }
  }, [isListening])

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results?.[0]?.transcript
    if (transcript) {
      onTranscript(transcript)
    }
  })

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false)
  })

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false)
    console.warn('Speech recognition event error:', event.error)
  })

  const handlePress = async () => {
    if (disabled) return

    if (isListening) {
      stopOfflineListening()
      setIsListening(false)
    } else {
      const granted = await requestVoicePermissions()
      if (!granted) {
        Alert.alert('Permiso requerido', Strings.ASSISTANT.MIC_PERMISSION_REQUIRED)
        return
      }

      try {
        startOfflineListening('es-MX')
        setIsListening(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setIsListening(false)
      }
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.container,
          isListening && styles.containerListening,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={24}
          color={isListening ? '#ef5350' : disabled ? '#757575' : '#ffffff'}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchable: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#383838',
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerListening: {
    backgroundColor: 'rgba(239, 83, 80, 0.25)',
  },
})
