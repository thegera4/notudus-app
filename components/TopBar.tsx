import { View, Text, StyleSheet } from 'react-native'
import TopBarIcon from './TopBarIcon'
import { ScreenEnum } from '@/constants/Enums'
import { TopBarProps } from '@/types'
import { deleteNote } from '@/utils/db';
import { router } from 'expo-router';

/**This is the App Bar component, which shows different options and icons, depending on the screen (notes,todos or add note).*/
export default function TopBar({screen, onLockPress, auth, onViewPress, view, onSearchPress, onBackPress, currentNote}: TopBarProps) {

  const styles = getStyles(screen);

  /**This function deletes the current note when the user taps the trash icon on the top bar.*/
  const onDeletePress = () => {
    // TODO: open a modal to confirm the deletion
    currentNote && deleteNote(currentNote.id)
    router.navigate('/')
  }

  return (
    <View style={styles.mainTopBar}>
      { screen !== ScreenEnum.AddNote ? 
        <View><Text style={styles.screenTitle}>{screen}</Text></View> :
        (onBackPress && <TopBarIcon onPress={onBackPress} iconName="arrow-back" size={24} color="white" />)
      }
      { screen === ScreenEnum.Notes &&
        <View style={styles.notesIcons}>
          {onLockPress && <TopBarIcon onPress={onLockPress} iconName={auth ? 'lock-open' : 'lock-closed'} size={24} color="white" />}
          {onSearchPress && <TopBarIcon onPress={onSearchPress} iconName="search" size={24} color="white" />}
          {onViewPress && <TopBarIcon onPress={onViewPress} iconName={view === 'list' ? 'list' : 'grid'} size={24} color="white" />}
        </View>
      }
      { screen === ScreenEnum.AddNote && currentNote &&
        <View style={styles.notesIcons}>
          <TopBarIcon onPress={onDeletePress} iconName={'trash'} size={24} color="white" />
        </View>
      }
    </View>
  )
}

const getStyles = (screen: string) => StyleSheet.create({
  todosIcon: { paddingRight: 16 },
  mainTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 16,
  },
  notesIcons: {
    flexDirection: 'row',
    justifyContent: screen !== ScreenEnum.AddNote ? 'space-between' : 'flex-end',
    width: 130,
    paddingRight: 16,
  },
})