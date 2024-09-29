import { useEffect } from 'react'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { AuthProvider } from '@/contexts/authContext'
import 'react-native-get-random-values'
import { initDB } from '@/utils/db'
import SpaceMonodRegular from '../assets/fonts/SpaceMono-Regular.ttf'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({ SpaceMono: SpaceMonodRegular })

  useEffect(() => { initDB() }, [])

  useEffect(() => { loaded && SplashScreen.hideAsync() }, [loaded])

  if (!loaded) { return null }

  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="addNote" options={{ headerShown: false }}/>
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}