import { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListNoteItem from '@/components/ListNoteItem';
import TopBar from '@/components/TopBar';
import FAB from '@/components/FAB';
import { getNotes } from '@/utils/db';
import { ScreenEnum } from '@/constants/Enums';
import { Note } from '@/types';
import { notes as notesFromDB } from '@/fakenotes';
import AsyncStorage from '@react-native-async-storage/async-storage'
import GridNoteItem from '@/components/GridNoteItem';

/**
 * The Notes screen shows a list of notes in a grid or list view. It is the default screen when the app is opened.
*/
export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>(notesFromDB)
  const [auth, setAuth] = useState<boolean>(false) // change to context when needed
  const [view, setView] = useState<string>('list')

  const filteredNotes = useMemo(() => getNotes(auth, notesFromDB), [auth, notesFromDB]);

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

  useEffect(() => { setNotes(filteredNotes) }, [filteredNotes]) 

  /**
   * This function handles the authentication of the user when the lock icon is pressed.
  */
  const handleAuth = useCallback(() => setAuth(prevAuth => !prevAuth), []) // change to context when needed

  /**
   * This function changes the value stored in shared preferences for the view of the notes screen,
   * and also changes the view state to show the notes in a grid or list view.
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

  /**
   * This function opens the Add Note screen when the FAB is pressed.
  */
  const handleAddNote = () => {
    console.log('Add Note button pressed');
  };

  /**
   * This function handles the press event of a note item.
  */
  const handleNotePressed = () => {
    console.log('Note pressed');
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar screen={ScreenEnum.Notes} onLockPress={handleAuth} auth={auth} onViewPress={handleView} view={view}/>
      <FlatList
        data={notes}
        renderItem={({item}) => view === 'list' ? <ListNoteItem note={item} onPress={handleNotePressed} /> 
          : <GridNoteItem note={item} onPress={handleNotePressed}/>
        }
        keyExtractor={item => item.id.toString()}
        numColumns={view === 'grid' ? 2 : 1}
        key={view} // key prop is needed to re-render the FlatList when the view changes
        initialNumToRender={10}
      />
      <FAB onPress={handleAddNote}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});