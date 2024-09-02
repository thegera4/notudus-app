import { ScreenEnum } from '@/constants/Enums'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { TopBarProps } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * This function changes the value stored in shared preferences for the view of the notes screen (list or grid).
 */
const handleView = async () => {
  try {
    const value = await AsyncStorage.getItem('view')
    if (value === 'list') {
      await AsyncStorage.setItem('view', 'grid')
    } else {
      await AsyncStorage.setItem('view', 'list')
    }
  } catch (e) {
    console.error(`error while changing the note list view: ${e}`)
  }
}

/**
 * This is the App Bar component, which shows different options and icons, depending on the screen (notes or todos).
 */
export default function TopBar({screen}: TopBarProps) {
  return (
    <View style={styles.mainTopBar}>
      <View><Text style={styles.screenTitle}>{screen}</Text></View>
      { screen === ScreenEnum.Notes &&
        <View style={styles.notesIcons}>
          <Pressable style={({pressed}) => pressed && styles.pressed} onPress={() => console.log('lock')}>
            <Ionicons name="lock-closed" size={24} color="white" />
          </Pressable>
          <Pressable style={({pressed}) => pressed && styles.pressed} onPress={() => console.log('search')}>
            <Ionicons name="search" size={24} color="white" />
          </Pressable>
          <Pressable style={({pressed}) => pressed && styles.pressed} onPress={handleView}>
            <Ionicons name="list" size={24} color="white" />
          </Pressable>
        </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  mainTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 130,
    paddingRight: 16,
  },
  todosIcon: {
    paddingRight: 16,
  },
  screenTitle: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold',
      paddingLeft: 16,
  },
  pressed: {
    opacity: 0.5,
  }
})