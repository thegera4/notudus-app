import { useState } from 'react'
import FAB from '@/components/shared/FAB'
import TopBar from '@/components/shared/TopBar'
import BottomSheet from '@/components/todos/BottomSheet'
import { ScreenEnum } from '@/constants/Enums'
import { Strings } from '@/constants/Strings'
import { StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function TodoScreen() {

  const [visible, setVisible] = useState<boolean>(false)

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar screen={ScreenEnum.Todos} auth={false} view={Strings.TOPBAR.TODOS}/>
      <Text style={styles.screenTitle}>{'12'} Tasks</Text>
      <FAB onPress={() => setVisible(true)}/>
      { visible && <BottomSheet setVisible={() => setVisible(!visible)}/> }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screenTitle: { 
    color: 'white',
    fontSize: 18,
    flex: 1,
    marginTop: 10,
    marginLeft: 16,
  },
})