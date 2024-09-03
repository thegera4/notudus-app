import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TopBarIcon from './TopBarIcon'
import { ScreenEnum } from '@/constants/Enums'
import { TopBarProps, noteSearchType } from '@/types'

/**
  * This is the App Bar component, which shows different options and icons, depending on the screen (notes or todos).
*/
export default function TopBar({screen, onLockPress, auth}: TopBarProps) {
  const [view, setView] = useState<string>('list')
  const [search, setSearch] = useState<noteSearchType>(null)

  useEffect(() => {
    const getView = async () => {
      try {
        const value = await AsyncStorage.getItem('view')
        value !== null && setView(value)
      } catch (e) {
        console.error(`error while getting the note list view: ${e}`)
      }
    }
    getView()
  }, [])

  /**
   * This function handles opens the search overlay when the search icon is pressed.
   */
  const handleSearch = useCallback(() => {}, [])

  /**
   * This function changes the value stored in shared preferences for the view of the notes screen (list or grid).
   */
  const handleView = useCallback(async () => {
    try {
      if (view === 'list') {
        await AsyncStorage.setItem('view', 'grid')
        setView('grid')
      } else {
        await AsyncStorage.setItem('view', 'list')
        setView('list')
      }
    } catch (e) {
      console.error(`error while changing the note list view: ${e}`)
    }
  }, [view])

  return (
    <View style={styles.mainTopBar}>
      <View><Text style={styles.screenTitle}>{screen}</Text></View>
      { screen === ScreenEnum.Notes &&
        <View style={styles.notesIcons}>
          <TopBarIcon onPress={onLockPress} iconName={auth ? 'lock-open' : 'lock-closed'} size={24} color="white" />
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