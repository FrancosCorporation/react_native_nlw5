import type { NavigatorScreenParams } from '@react-navigation/native'
import type { PlantsProps } from '../libs/storage'

export interface ConfirmationParams {
  title: string
  subtitle: string
  titleButton: string
  icon: 'smile' | 'hub'
}

export type MainTabsParamList = {
  'Nova Planta': undefined
  'Minhas Plantas': undefined
}

export type RootStackParamList = {
  Welcome: undefined
  UserIdentification: undefined
  Confirmed: ConfirmationParams
  PlantSelect: NavigatorScreenParams<MainTabsParamList> | undefined
  PlantSave: { plant: PlantsProps }
}
