import { Text, StyleSheet } from 'react-native'

/**This component shows the word "Private" in green, bold letters.*/
export default function PrivateText() {
  return <Text style={styles.private}>Private</Text>
}

const styles = StyleSheet.create({
  private: { color: 'green', borderColor: 'green', fontWeight: 'bold',},
})