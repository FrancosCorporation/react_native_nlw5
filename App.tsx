import 'react-native-gesture-handler'

import React, { useEffect } from 'react'
import { useFonts, Jost_400Regular, Jost_600SemiBold } from '@expo-google-fonts/jost'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import Routes from './src/routes'

SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Jost_400Regular,
    Jost_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return <Routes />
}
