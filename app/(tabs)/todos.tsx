import TopBar from '@/components/shared/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { Strings } from '@/constants/Strings';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TodoScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar screen={ScreenEnum.Todos} auth={false} view={Strings.TOPBAR.TODOS}/>
      <Text style={styles.screenTitle}>Aqui va la pantalla de todos</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenTitle: { color: 'white' },
});