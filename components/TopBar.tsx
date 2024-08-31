import { View, Text, StyleSheet } from 'react-native'

type TopBarProps = {
    screen: string
}

/**
 * This is the App Bar component, which shows different options and icons, depending on the screen (notes or todos).
 */
export default function TopBar({screen}: TopBarProps) {
  return (
    <View>
      <Text style={styles.screenTitle}>{screen}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    screenTitle: {
      color: 'white',
    },
});