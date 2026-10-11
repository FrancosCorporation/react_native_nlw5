import AsyncStorage from '@react-native-async-storage/async-storage'
import { format } from 'date-fns'
import * as Notifications from 'expo-notifications'
import { Alert, Platform } from 'react-native'

export interface PlantsProps {
  id: string | number
  name: string
  about: string
  water_tips: string
  photo: string
  environments: string[]
  frequency: {
    times: number
    repeat_every: 'day' | 'week'
  }
  dateTimeNotification?: Date | string
  hour?: string
}

export type SavedPlantProps = PlantsProps & {
  dateTimeNotification: Date | string
}

interface StoragePlantProps {
  data: SavedPlantProps
  notificationIds?: string[]
  notificationId?: string
}

export interface StorageProps {
  [id: string]: StoragePlantProps
}

const PLANTS_STORAGE_KEY = '@react_native_nlw5:plant'

function getWeeklyDays(plant: SavedPlantProps): number[] {
  const count = Math.max(1, Math.min(7, Math.trunc(plant.frequency.times)))
  const selectedDay = new Date(plant.dateTimeNotification).getDay()
  const now = new Date()
  const selectedTime = new Date(plant.dateTimeNotification)
  const startsTomorrow =
    selectedDay === now.getDay() &&
    (selectedTime.getHours() < now.getHours() ||
      (selectedTime.getHours() === now.getHours() && selectedTime.getMinutes() <= now.getMinutes()))
  const firstDay = (selectedDay + (startsTomorrow ? 1 : 0)) % 7

  return Array.from({ length: count }, (_, index) => (firstDay + Math.floor((7 * index) / count)) % 7)
}

export function getNextWateringDate(plant: SavedPlantProps, now = new Date()): Date {
  const selectedTime = new Date(plant.dateTimeNotification)
  const hour = selectedTime.getHours()
  const minute = selectedTime.getMinutes()

  if (plant.frequency.repeat_every === 'day') {
    const next = new Date(now)
    next.setHours(hour, minute, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    return next
  }

  return getWeeklyDays(plant)
    .map((weekday) => {
      const next = new Date(now)
      const daysUntil = (weekday - now.getDay() + 7) % 7
      next.setDate(now.getDate() + daysUntil)
      next.setHours(hour, minute, 0, 0)
      if (next <= now) next.setDate(next.getDate() + 7)
      return next
    })
    .sort((first, second) => first.getTime() - second.getTime())[0]
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lembretes de rega',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const currentPermission = await Notifications.getPermissionsAsync()
  if (currentPermission.granted) return true

  const requestedPermission = await Notifications.requestPermissionsAsync()
  if (requestedPermission.granted) return true

  Alert.alert(
    'Lembretes desativados',
    'A planta será salva, mas o aplicativo não poderá avisar quando chegar a hora de regar.',
  )
  return false
}

function getNotificationTriggers(plant: SavedPlantProps): Notifications.SchedulableNotificationTriggerInput[] {
  const selectedTime = new Date(plant.dateTimeNotification)
  const time = {
    hour: selectedTime.getHours(),
    minute: selectedTime.getMinutes(),
  }

  if (plant.frequency.repeat_every === 'day') {
    return [{ type: Notifications.SchedulableTriggerInputTypes.DAILY, ...time }]
  }

  return getWeeklyDays(plant).map((weekday) => ({
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: weekday + 1,
    ...time,
  }))
}

export async function savePlant(plant: SavedPlantProps): Promise<void> {
  const notificationIds: string[] = []
  const canNotify = await requestNotificationPermission()

  try {
    if (canNotify) {
      const triggers = getNotificationTriggers(plant)
      for (const trigger of triggers) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Hora de cuidar da sua planta 🌱',
            body: `Regue ${plant.name} no horário combinado.`,
            data: { plantId: plant.id },
          },
          trigger,
        })
        notificationIds.push(notificationId)
      }
    }

    const stored = await AsyncStorage.getItem(PLANTS_STORAGE_KEY)
    const plants = stored ? (JSON.parse(stored) as StorageProps) : {}
    plants[String(plant.id)] = { data: plant, notificationIds }
    await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants))
  } catch (error) {
    await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
    throw error instanceof Error ? error : new Error('Não foi possível salvar a planta.')
  }
}

export async function loadPlant(): Promise<SavedPlantProps[]> {
  const stored = await AsyncStorage.getItem(PLANTS_STORAGE_KEY)
  const plants = stored ? (JSON.parse(stored) as StorageProps) : {}

  return Object.values(plants)
    .map(({ data }) => ({
      ...data,
      hour: format(new Date(data.dateTimeNotification), 'HH:mm'),
    }))
    .sort((first, second) => getNextWateringDate(first).getTime() - getNextWateringDate(second).getTime())
}

export async function removePlant(id: string | number): Promise<void> {
  const stored = await AsyncStorage.getItem(PLANTS_STORAGE_KEY)
  const plants = stored ? (JSON.parse(stored) as StorageProps) : {}
  const plant = plants[String(id)]
  if (!plant) return

  const notificationIds = plant.notificationIds ?? (plant.notificationId ? [plant.notificationId] : [])
  await Promise.all(notificationIds.map((notificationId) => Notifications.cancelScheduledNotificationAsync(notificationId)))
  delete plants[String(id)]
  await AsyncStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants))
}
