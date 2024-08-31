import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TodoScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar screen={ScreenEnum.Todos} />
      <Text style={styles.screenTitle}>Aqui va la pantalla de todos</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    color: 'white',
  },
});