import { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NoteItem from '@/components/NoteItem';
import TopBar from '@/components/TopBar';
import { getNotes } from '@/utils/db';
import { ScreenEnum } from '@/constants/Enums';
import { Note } from '@/types';
import { notes as notesFromDB } from '@/fakenotes';

/**
 * The Notes screen shows a list of notes in a grid or list view. It is the default screen when the app is opened.
*/
export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>(notesFromDB)
  const [auth, setAuth] = useState<boolean>(false) // change to context when needed

  const filteredNotes = useMemo(() => getNotes(auth, notesFromDB), [auth, notesFromDB]);

  useEffect(() => { setNotes(filteredNotes) }, [filteredNotes]) 

  /**
   * This function handles the authentication of the user when the lock icon is pressed.
  */
  const handleAuth = useCallback(() => setAuth(prevAuth => !prevAuth), []) // change to context when needed

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar screen={ScreenEnum.Notes} onLockPress={handleAuth} auth={auth} />
      <FlatList
        data={notes}
        renderItem={({item}) => <NoteItem note={item} />}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});