import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar screen={ScreenEnum.Notes} />
      <Text style={styles.textColor}>Aqui va la pantalla de notas</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textColor: {
    color: 'white',
  },
});