import { useState, useEffect } from 'react'
import { ScreenEnum } from '@/constants/Enums'
import { View, Text, StyleSheet } from 'react-native'
import { TopBarProps } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TopBarIcon from './TopBarIcon'

/**
 * This function handles the authentication of the user when the lock icon is pressed.
 */
const handleAuth = async () => {}
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
 * This function handles opens the search overlay when the search icon is pressed.
 */
const handleSearch = () => {}
/**
 * This is the App Bar component, which shows different options and icons, depending on the screen (notes or todos).
 */
export default function TopBar({screen}: TopBarProps) {
  const [view, setView] = useState<string>('list')

  useEffect(() => {
    const getView = async () => {
      try {
        const value = await AsyncStorage.getItem('view')
        if (value !== null) {
          setView(value)
        }
      } catch (e) {
        console.error(`error while getting the note list view: ${e}`)
      }
    }
    getView()
  }, [])



  return (
    <View style={styles.mainTopBar}>
      <View><Text style={styles.screenTitle}>{screen}</Text></View>
      { screen === ScreenEnum.Notes &&
        <View style={styles.notesIcons}>
          <TopBarIcon onPress={handleAuth} iconName="lock-closed" size={24} color="white" />
          <TopBarIcon onPress={handleSearch} iconName="search" size={24} color="white" />
          <TopBarIcon onPress={handleView} iconName={view === 'list' ? 'list' : 'grid'} size={24} color="white" />
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
})