import NoteItem from '@/components/NoteItem';
import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar screen={ScreenEnum.Notes} />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
      <NoteItem />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textColor: {
    color: 'white',
  },
});