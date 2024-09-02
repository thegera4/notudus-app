import NoteItem from '@/components/NoteItem';
import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notes } from '@/fakenotes';

export default function NotesScreen() {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar screen={ScreenEnum.Notes} />
      <FlatList
        data={notes}
        renderItem={({ item }) => <NoteItem note={item} />}
        keyExtractor={item => item.id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});