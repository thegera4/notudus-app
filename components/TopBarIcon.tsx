import { TopBarIconProps } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet } from 'react-native'

export default function TopBarIcon({onPress, iconName, size, color}: TopBarIconProps) {
  return (
    <Pressable style={({pressed}) => pressed && styles.pressed} onPress={onPress}>
        <Ionicons name={iconName} size={size} color={color} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
    pressed: {
      opacity: 0.5,
    }
  })