import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { FlatList, StyleSheet, Alert, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ListNoteItem from '@/components/ListNoteItem'
import TopBar from '@/components/TopBar'
import FAB from '@/components/FAB'
import GridNoteItem from '@/components/GridNoteItem'
import SearchOverlay from '@/components/SearchOverlay'
import { getNotes } from '@/utils/db'
import { ScreenEnum } from '@/constants/Enums'
import { Note } from '@/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '@/hooks/useAuth'
import {addNoteRoute} from "@/constants/Routes"
import { Strings}  from '@/constants/Strings'
import LottieView from 'lottie-react-native';
import * as emptyAnimation from '@/assets/animations/empty.json'

/**The Notes screen shows a list of notes in a grid or list view. It is the default screen when the app is opened.*/
export default function NotesScreen() {

  const [notes, setNotes] = useState<Note[]>([])
  const [view, setView] = useState<string>('list')
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { auth, setAuth } = useAuth()

  const animation = useRef<LottieView>(null);

  const filteredNotes = useMemo(() => getNotes(auth), [auth])

  // control the animation
  useEffect(() => { animation.current?.play() }, [])

  // get the view from shared preferences if it exists
  useEffect(() => {
    const getView = async () => {
      const value = await AsyncStorage.getItem('view')
      value !== null && setView(value)
    }
    getView()
  }, [])

  // update the notes when a new note is added/updated (onBack from AddNoteScreen)
  useFocusEffect(
    useCallback(() => { 
      const loadNotes = async () => {
        try{
          const notes = await getNotes(auth) as Note[]
          setNotes(notes)
        } catch (e) {
          //TODO: cambiar por snackbar
          Alert.alert("Error", "An error occurred while loading the notes", [{text: 'OK'}])
        }
      }
      loadNotes()
    }, [auth])
  )

  // sets the "notes" state (when the user is authenticated) to hide/show the private notes.
  useEffect(() => { 
    const fetchFilteredNotes = async () => {
      const notes = await filteredNotes
      setNotes(notes)
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
      //TODO: cambiar por snackbar
      Alert.alert(Strings.MODALS.AUTH_ERROR, Strings.MODALS.WRONG_AUTH, [{text: 'OK'}])
    }
  }, [auth])

  /** 
   * This function changes the value stored in shared preferences for the view of the notes screen,
   * and also changes the view state to show the notes in a grid or list view.
   * @returns {void} This function does not return anything.
  */
  const handleView = useCallback(async (): Promise<void> => {
    try {
      if (view === 'list') {
        await AsyncStorage.setItem('view', 'grid')
        setView('grid')
      } else {
        await AsyncStorage.setItem('view', 'list')
        setView('list')
      }
    } catch (e) {
      //TODO: cambiar por snackbar
      Alert.alert("Error", "An error occurred while changing the view", [{text: 'OK'}])
    }
  }, [view])

  /** This function opens the Add Note screen when the FAB is pressed.*/
  const handleAddNote = (): void => router.navigate(addNoteRoute)

  /** 
   * This function handles the press event of a note item (navigates to the Add Note screen with the note data to be edited).
   * @param {Note} note - The note object that contains the information to be edited.
   * @returns {void} This function does not return anything.
   * */
  const handleNotePressed = (note: Note): void => {
    const noteData = {
      id: note.id,
      title: note.title,
      content: note.content,
      locked: note.locked,
      date: note.date,
    };
    router.push({pathname: addNoteRoute, params: { note: JSON.stringify(noteData) }})
  }

  /** This function opens the search overlay when the search icon is pressed.*/
  const handleSearchPress = (): void => setIsSearchVisible(true)

  /** This function closes the search overlay.*/
  const handleCloseSearch = (): void => { setIsSearchVisible(false); setSearchTerm('') }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar 
        screen={ScreenEnum.Notes} 
        onLockPress={handleAuth} 
        auth={auth} 
        onViewPress={handleView} 
        view={view} 
        onSearchPress={handleSearchPress}
      />
      { notes.length === 0 || notes === undefined ?
        <View style={styles.animationContainer}>
          <LottieView ref={animation} source={emptyAnimation} autoPlay loop={false} style={styles.animation}/>
          <Text style={styles.emptyText}>No notes! Add a new note with the + button.</Text>
        </View>
        :
        <FlatList
          data={notes}
          renderItem={({item}) => view === 'list' ? 
            <ListNoteItem note={item} onPress={handleNotePressed} /> : <GridNoteItem note={item} onPress={handleNotePressed}/>
          }
          keyExtractor={item => item.id.toString()}
          numColumns={view === 'grid' ? 2 : 1}
          key={view} // key prop is needed to re-render the FlatList when the view changes
          initialNumToRender={10}
        />
      }
      <FAB onPress={handleAddNote}/>
      <SearchOverlay 
        visible={isSearchVisible}
        notes={notes}
        onClose={handleCloseSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm} 
        handleNotePressed={handleNotePressed}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: { flex: 1 },
  animationContainer: { flex: 1, alignItems: 'center', marginTop: 80 },
  animation: { width: 200, height: 200, alignSelf: 'center' },
  emptyText: { color: 'white', fontSize: 16, textAlign: 'center' },
})