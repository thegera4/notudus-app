import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ListNoteItem from '@/components/notes/ListNoteItem'
import TopBar from '@/components/shared/TopBar'
import GridNoteItem from '@/components/notes/GridNoteItem'
import SearchOverlay from '@/components/notes/SearchOverlay'
import { ScreenEnum } from '@/constants/Enums'
import { NoteModelType } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '@/hooks/useAuth'
import {addNoteRoute} from "@/constants/Routes"
import { Strings}  from '@/constants/Strings'
import Note from '@/models/Note'
import NoDataAnimation from '@/components/shared/NoDataAnimation'
import CustomLoading from '@/components/shared/CustomLoading'

/** The Notes screen shows a list of notes in a grid or list view. It is the default screen when the app is opened.*/
export default function NotesScreen() {

  const [notes, setNotes] = useState<NoteModelType[]>([])
  const [view, setView] = useState<string>(Strings.NOTES.LIST)
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [screenIsLoading, setScreenIsLoading] = useState<boolean>(true)

  const { auth, setAuth } = useAuth()

  const flatListRef = useRef<FlatList<NoteModelType>>(null)

  const filteredNotes = useMemo(() => Note.getNotes(auth), [auth])

  /** This function opens the search overlay when the search icon is pressed.*/
  const handleSearchPress = (): void => setIsSearchVisible(true)

  /** This function closes the search overlay.*/
  const handleCloseSearch = (): void => { setIsSearchVisible(false); setSearchTerm('') }

  // get the view from shared preferences if it exists
  useEffect(() => {
    const getView = async () => {
      const value = await AsyncStorage.getItem(Strings.NOTES.VIEW)
      value !== null && setView(value)
    }
    getView()
  }, [])

  // update the notes when a new note is added/updated (onBack from AddNoteScreen)
  useFocusEffect(
    useCallback(() => { 
      handleCloseSearch()
      const loadNotes = async () => {
        try{
          const notes = await Note.getNotes(auth) as NoteModelType[]
          notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setNotes(notes)
          setScreenIsLoading(false)
        } catch (e) {
          console.error(Strings.ERRORS.LOADING, e)
        }
      }
      loadNotes()
    }, [auth])
  )

  // sets the "notes" state (when the user is authenticated) to hide/show the private notes.
  useEffect(() => { 
    const fetchFilteredNotes = async () => {
      const notes = await filteredNotes
      notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setNotes(notes)
      setScreenIsLoading(false)
    }
    fetchFilteredNotes()
  }, [filteredNotes]) 

  /**
  * This function handles the authentication of the user when the lock icon is pressed. It uses the LocalAuthentication API to 
  * authenticate the user with their fingerprint/password. If the user is already authenticated, it hides the private notes.
  * @returns {void} This function does not return anything.
  */
  const handleAuth = useCallback(async (): Promise<void> => { 
    if(auth){ setAuth(false); return }
    try{
      const result = await LocalAuthentication.authenticateAsync()
      result.success && setAuth(true)
    } catch (e) {
      console.error(Strings.ERRORS.AUTH_ERROR, e)
    }
  }, [auth])

  /** 
  * This function changes the value stored in shared preferences for the view of the notes screen,
  * and also changes the view state to show the notes in a grid or list view.
  * @returns {void} This function does not return anything.
  */
  const handleView = useCallback(async (): Promise<void> => {
    try {
      if (view === Strings.NOTES.LIST) {
        await AsyncStorage.setItem(Strings.NOTES.VIEW, Strings.NOTES.GRID)
        setView(Strings.NOTES.GRID)
      } else {
        await AsyncStorage.setItem(Strings.NOTES.VIEW, Strings.NOTES.LIST)
        setView(Strings.NOTES.LIST)
      }
    } catch (e) {
      console.error(Strings.ERRORS.CHANGE_VIEW, e) 
    }
  }, [view])

  /** 
  * This function handles the press event of a note item (navigates to the Add Note screen with the note data to be edited).
  * @param {NoteModelType} note - The note object that contains the information to be edited.
  * @returns {void} This function does not return anything.
  */
  const handleNotePressed = (note: NoteModelType): void => {
    const noteData: NoteModelType = {
      id: note.id,
      title: note.title,
      content: note.content,
      locked: note.locked,
      date: note.date,
    }
    router.push({pathname: addNoteRoute, params: { note: JSON.stringify(noteData) }})
  }

  /** This function provides the layout for each item. 
  * @param {any} _data - The data for the item.
  * @param {number} index - The index of the item.
  * @returns {object} An object containing the length, offset, and index of the item.
  */
  const getItemLayout = useCallback((_data: any, index: number) => ({length: 50, offset: 50 * index, index}), [])

  // Scroll to the last item when a new note is added.
  /*useEffect(() => {
    if (notes && notes.length > 0 && view === Strings.NOTES.LIST) {
      setTimeout(() => { flatListRef.current?.scrollToIndex({index: notes.length - 1, animated: true}) }, 100)
    }
  }, [notes])*/

  return (
    <SafeAreaView style={styles.safeAreaView}>
      { screenIsLoading ? <CustomLoading /> :
        <>
          <TopBar screen={ScreenEnum.Notes} onLockPress={handleAuth} auth={auth} onViewPress={handleView} view={view} onSearchPress={handleSearchPress}/>
          <FlatList
            ref={flatListRef}
            data={notes}
            renderItem={({item}) => view === Strings.NOTES.LIST ? 
              <ListNoteItem note={item} onPress={handleNotePressed}/> : <GridNoteItem note={item} onPress={handleNotePressed}/>
            }
            keyExtractor={item => item.id}
            numColumns={view === Strings.NOTES.GRID ? 2 : 1}
            key={view} // key prop is needed to re-render the FlatList when the view changes
            initialNumToRender={10}
            windowSize={10}
            getItemLayout={getItemLayout}
            ListEmptyComponent={<NoDataAnimation screen={ScreenEnum.Notes}/>}
          />
        </>
      }
      <SearchOverlay visible={isSearchVisible} notes={notes} onClose={handleCloseSearch} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleNotePressed={handleNotePressed}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: { flex: 1 },
})