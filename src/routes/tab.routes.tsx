import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import colors from '../styles/colors'
import { MyPlants } from '../pages/MyPlants'
import { PlantSelect } from '../pages/PlantSelect'
import type { MainTabsParamList } from './types'

const Tabs = createBottomTabNavigator<MainTabsParamList>()

export default function AuthRoutes() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.heading,
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: {
          height: 72,
          paddingVertical: 10,
        },
      }}
    >
      <Tabs.Screen
        name="Nova Planta"
        component={PlantSelect}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Minhas Plantas"
        component={MyPlants}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  )
}
