import { useState, useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import TopBarIcon from './TopBarIcon'
import { ScreenEnum } from '@/constants/Enums'
import { TopBarProps, noteSearchType } from '@/types'

/**
  * This is the App Bar component, which shows different options and icons, depending on the screen (notes or todos).
*/
export default function TopBar({screen, onLockPress, auth, onViewPress, view, onSearchPress}: TopBarProps) {
  const [search, setSearch] = useState<noteSearchType>(null)

  /**
   * This function handles opens the search overlay when the search icon is pressed.
   */
  const handleSearch = useCallback(() => {}, [])

  return (
    <View style={styles.mainTopBar}>
      <View><Text style={styles.screenTitle}>{screen}</Text></View>
      { screen === ScreenEnum.Notes &&
        <View style={styles.notesIcons}>
          <TopBarIcon onPress={onLockPress} iconName={auth ? 'lock-open' : 'lock-closed'} size={24} color="white" />
          <TopBarIcon onPress={onSearchPress} iconName="search" size={24} color="white" />
          <TopBarIcon onPress={onViewPress} iconName={view === 'list' ? 'list' : 'grid'} size={24} color="white" />
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