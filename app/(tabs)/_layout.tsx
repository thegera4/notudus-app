import { Tabs } from 'expo-router'
import React from 'react'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { Colors } from '@/constants/Colors'

export default function TabLayout() {
  return (
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
            <TabBarIcon name={focused ? 'pencil' : 'pencil-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'ToDos',
          tabBarIcon: ({ color }) => ( <TabBarIcon name={'list'} color={color} />),
        }}
      />
    </Tabs>
  );
}