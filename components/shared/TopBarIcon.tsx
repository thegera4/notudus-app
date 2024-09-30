import { TopBarIconProps } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet } from 'react-native'

export default function TopBarIcon({onPress, iconName, size, color}: TopBarIconProps) {
  return (
    <Pressable 
      style={({pressed}) => (iconName === "shield" || iconName === "shield-outline") ? styles.shieldIcon :
        (iconName !== "arrow-back") ? (pressed && styles.pressed) : 
        (pressed ? [styles.pressed, styles.arrowBackIcon] : styles.arrowBackIcon)
      } 
      onPress={onPress}
    >
      <Ionicons name={iconName} size={size} color={color} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.5,
  },
  arrowBackIcon: {
    paddingLeft: 13,
    marginTop: 2,
  },
  shieldIcon: {
    paddingRight: 10,
  },
})