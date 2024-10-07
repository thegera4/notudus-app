import { router, Tabs } from 'expo-router'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { Colors } from '@/constants/Colors'
import FAB from '@/components/shared/FAB';
import { View } from 'react-native'
import { addNoteRoute } from '@/constants/Routes';
import { useNavigationState } from "@react-navigation/native"; 
import { useBottomSheet } from '@/hooks/useBottomSheet'

export default function TabLayout() {

  const navigationState = useNavigationState(state => state)

  const { openBottomSheet } = useBottomSheet()

  /** This function opens the Add Note screen when the FAB is pressed.*/
  const handleAddNote = (): void => router.navigate(addNoteRoute)

  /** This function checks the selected screen/tab and returns the proper action for the FAB button.*/
  const getFabAction = (): void => {
    const currentRoute = navigationState.routes[navigationState.index]?.state?.routes?.
      [navigationState.routes[navigationState.index]?.state?.index ?? 0]?.name ?? 'unknown'
    currentRoute === 'index' ? handleAddNote() : openBottomSheet()
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.bottomNavigation.active,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "black",
          }, 
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'create' : 'create-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="todos"
          options={{
            title: 'Todos',
            tabBarIcon: ({ color, focused }) => ( 
              <TabBarIcon name={focused ? 'list' : 'list-outline'} color={color} />
            ),
          }}
        />
      </Tabs>
      <FAB onPress={getFabAction} />
    </View>
  );
}