import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import TopBarIcon from './TopBarIcon'
import { ScreenEnum } from '@/constants/Enums'
import { TopBarProps } from '@/types'
import { deleteNote } from '@/utils/db'
import { router } from 'expo-router'
import { homeRoute } from "@/constants/Routes"
import CustomModal from './CustomModal'

/**This is the App Bar component, which shows different options and icons, depending on the screen (notes,todos or add note).*/
export default function TopBar({ screen, onLockPress, auth, onViewPress, view, onSearchPress, onBackPress,
  currentNote, onShieldPress, newNoteLocked }: TopBarProps) {

  const styles = getStyles(screen)

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

  /**This function opens the modal to confirm the deletion of the current note.*/
  const onDeletePress = (): void => setOpenDeleteModal(true)

  /**This function deletes the current note and navigates back to the main notes screen.*/
  const onConfirmDelete = (): void => {
    currentNote && deleteNote(currentNote.id)
    setOpenDeleteModal(false)
    router.navigate(homeRoute)
  }

  return (
    <View style={styles.mainTopBar}>
      { screen !== ScreenEnum.AddNote ? 
        <View><Text style={styles.screenTitle}>{screen}</Text></View> :
        (onBackPress && <TopBarIcon onPress={onBackPress} iconName="arrow-back" size={24} color="white" />)
      }
      { screen === ScreenEnum.AddNote && currentNote === undefined &&
        (onShieldPress && <TopBarIcon onPress={onShieldPress} iconName={newNoteLocked ? 'shield' : 'shield-outline'} size={24} color="white" />)
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
      { openDeleteModal && 
        <CustomModal
          title="Delete Note"
          message="Are you sure you want to delete this note?"
          confirmText="DELETE"
          cancelText="CANCEL"
          onConfirm={onConfirmDelete}
          onCancel={() => setOpenDeleteModal(false)}
          visible={openDeleteModal}
        />
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