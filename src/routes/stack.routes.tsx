import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Confirmation } from '../pages/Confirmation'
import { PlantSave } from '../pages/PlantSave'
import { UserIdentification } from '../pages/UserIdentification'
import { Welcome } from '../pages/Welcome'
import AuthRoutes from './tab.routes'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function StackRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="UserIdentification" component={UserIdentification} />
      <Stack.Screen name="Confirmed" component={Confirmation} />
      <Stack.Screen name="PlantSelect" component={AuthRoutes} />
      <Stack.Screen name="PlantSave" component={PlantSave} />
    </Stack.Navigator>
  )
}
