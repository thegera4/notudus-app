import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import LottieView from 'lottie-react-native'
import { Colors } from '@/constants/Colors'
import * as deleteAnimation from '@/assets/animations/delete.json'
import { CustomModalProps } from '@/types'

export default function CustomModal({title, message, confirmText, cancelText, onConfirm, onCancel, visible}: CustomModalProps) {

  const animation = useRef<LottieView>(null)

  // control the animation
  useEffect(() => { animation.current?.play(); }, [])

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <LottieView ref={animation} source={deleteAnimation} autoPlay loop={false} style={styles.animation}/>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={styles.deleteText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: '80%',
    backgroundColor: Colors.dark.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  deleteText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  animation: { width: 80, height: 80, alignSelf: 'center' },
});