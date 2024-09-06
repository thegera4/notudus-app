import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

/**
  * This is the Add Note screen where you can define and add a new note, as well as update an existing note.
  * The lock icon allows you to make a note private and the back icon saves the changes.
*/
export default function AddNoteScreen() {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  /**
  * This function marks the note as "private" when the user taps the lock icon on the top bar.
  */
  const lockNote = () => { console.log('make private note') }
  /**
  * This function handles the back event to save the new notes, or the updated information of an existing note.
  */
  const onBack = () => { router.navigate('/') }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar 
        screen={ScreenEnum.AddNote} 
        onLockPress={lockNote} 
        auth={false} 
        view={ScreenEnum.AddNote}
        onBackPress={onBack}
      />
      <View style={styles.container}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          multiline
          style={styles.contentInput}
          placeholder="Note Content"
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={content}
          onChangeText={setContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',

  },
  contentInput: {
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
    color: 'white',
    backgroundColor: 'blue',
  },
});