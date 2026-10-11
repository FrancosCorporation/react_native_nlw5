import React, { useCallback, useState } from 'react'
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Load } from '../components/Load'
import { PlantcardSecondary } from '../components/PlantcardSecondary'
import { getNextWateringDate, loadPlant, removePlant } from '../libs/storage'
import type { SavedPlantProps } from '../libs/storage'
import type { MainTabsParamList } from '../routes/types'
import waterdrop from '../assets/waterdrop.png'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

export function MyPlants() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabsParamList, 'Minhas Plantas'>>()
  const [plants, setPlants] = useState<SavedPlantProps[]>([])
  const [loading, setLoading] = useState(true)

  const refreshPlants = useCallback(async () => {
    setLoading(true)
    try {
      setPlants(await loadPlant())
    } catch {
      Alert.alert('Não foi possível carregar suas plantas', 'Tente novamente em instantes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    void refreshPlants()
  }, [refreshPlants]))

  function confirmRemove(plant: SavedPlantProps) {
    Alert.alert('Remover planta?', `Deseja remover ${plant.name} e cancelar seus lembretes?`, [
      { text: 'Manter', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removePlant(plant.id)
            setPlants((current) => current.filter((item) => item.id !== plant.id))
          } catch {
            Alert.alert('Não foi possível remover a planta', 'Tente novamente em instantes.')
          }
        },
      },
    ])
  }

  if (loading) return <Load />

  const nextPlant = plants[0]
  const nextWatering = nextPlant ? getNextWateringDate(nextPlant) : undefined
  const nextWateringMessage = nextPlant && nextWatering
    ? `Próxima rega ${formatDistanceToNow(nextWatering, { addSuffix: true, locale: ptBR })}: ${nextPlant.name}.`
    : undefined

  return (
    <View style={styles.container}>
      <Header />
      {nextWateringMessage ? (
        <View style={styles.spotlight}>
          <Image source={waterdrop} style={styles.spotlightImage} accessibilityLabel="gota d'água" />
          <Text style={styles.spotlightText}>{nextWateringMessage}</Text>
        </View>
      ) : null}

      <View style={styles.plants}>
        <Text style={styles.plantsTitle}>Próximas regas</Text>
        <FlatList
          data={plants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlantcardSecondary data={item} handleRemove={() => confirmRemove(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={plants.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Seu jardim começa com uma planta</Text>
              <Text style={styles.emptyText}>Escolha uma espécie e agende um lembrete de rega.</Text>
              <Button
                titleButton="Encontrar plantas"
                onPress={() => navigation.navigate('Nova Planta')}
                style={styles.emptyButton}
              />
            </View>
          )}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: colors.background,
  },
  spotlight: {
    backgroundColor: colors.blue_light,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spotlightImage: {
    width: 52,
    height: 52,
  },
  spotlightText: {
    flex: 1,
    color: colors.blue,
    fontFamily: fonts.text,
    fontSize: 14,
    lineHeight: 20,
  },
  plants: {
    flex: 1,
    width: '100%',
  },
  plantsTitle: {
    fontSize: 22,
    fontFamily: fonts.heading,
    color: colors.heading,
    marginVertical: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 20,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: 22,
  },
})
