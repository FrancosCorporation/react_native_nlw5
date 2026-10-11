import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button } from '../components/Button'
import { EnviromentButton } from '../components/EnviromentButton'
import { Header } from '../components/Header'
import { Load } from '../components/Load'
import { PlantcardPrimary } from '../components/PlantcardPrimary'
import { api } from '../services/api'
import type { PlantsProps } from '../libs/storage'
import type { MainTabsParamList, RootStackParamList } from '../routes/types'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

const PAGE_SIZE = 10

interface EnvironmentProps {
  key: string
  title: string
}

export function PlantSelect() {
  const navigation = useNavigation<CompositeNavigationProp<
    BottomTabNavigationProp<MainTabsParamList, 'Nova Planta'>,
    NativeStackNavigationProp<RootStackParamList>
  >>()
  const [selectedEnvironment, setSelectedEnvironment] = useState('all')
  const [environments, setEnvironments] = useState<EnvironmentProps[]>([])
  const [plants, setPlants] = useState<PlantsProps[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const requestInFlight = useRef(false)

  const visiblePlants = useMemo(() => {
    if (selectedEnvironment === 'all') return plants
    return plants.filter((plant) => plant.environments.includes(selectedEnvironment))
  }, [plants, selectedEnvironment])

  const fetchPlants = useCallback(async (nextPage: number, append: boolean) => {
    if (requestInFlight.current) return
    requestInFlight.current = true
    setError(false)
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const { data } = await api.get<PlantsProps[]>(
        `plants?_sort=name&order=asc&_page=${nextPage}&_limit=${PAGE_SIZE}`,
      )
      setPlants((current) => append ? [...current, ...data] : data)
      setPage(nextPage)
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      requestInFlight.current = false
    }
  }, [])

  useEffect(() => {
    void fetchPlants(1, false)
    api.get<EnvironmentProps[]>('plants_environments?_sort=title&order=asc')
      .then(({ data }) => setEnvironments([{ key: 'all', title: 'Todos' }, ...data]))
      .catch(() => setEnvironments([{ key: 'all', title: 'Todos' }]))
  }, [fetchPlants])

  function handlePlantSelect(plant: PlantsProps) {
    navigation.navigate('PlantSave', { plant })
  }

  function handleFetchMore() {
    if (loading || loadingMore || !hasMore || requestInFlight.current) return
    void fetchPlants(page + 1, true)
  }

  if (loading) return <Load />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Header />
        <Text style={styles.title}>Encontre a próxima planta do seu jardim</Text>
        <Text style={styles.subtitle}>Escolha o ambiente onde ela vai ficar.</Text>
      </View>

      <FlatList
        horizontal
        data={environments}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <EnviromentButton
            title={item.title}
            active={item.key === selectedEnvironment}
            accessibilityRole="button"
            accessibilityState={{ selected: item.key === selectedEnvironment }}
            onPress={() => setSelectedEnvironment(item.key)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.environmentList}
        style={styles.environmentScroller}
      />

      {error ? (
        <View style={styles.messageState}>
          <Text style={styles.emptyTitle}>Não foi possível carregar as plantas</Text>
          <Text style={styles.emptyText}>Confira a conexão com o backend e tente novamente.</Text>
          <Button titleButton="Tentar novamente" onPress={() => void fetchPlants(1, false)} style={styles.retryButton} />
        </View>
      ) : (
        <FlatList
          data={visiblePlants}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PlantcardPrimary data={item} onPress={() => handlePlantSelect(item)} />
          )}
          onEndReached={handleFetchMore}
          onEndReachedThreshold={0.35}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          contentContainerStyle={styles.plantsList}
          ListEmptyComponent={(
            <View style={styles.messageState}>
              <Text style={styles.emptyTitle}>Nenhuma planta neste ambiente</Text>
              <Text style={styles.emptyText}>Escolha outra categoria para ver as opções disponíveis.</Text>
            </View>
          )}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.green} /> : null}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 14,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 20,
    lineHeight: 27,
    marginTop: 10,
  },
  subtitle: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  environmentScroller: {
    flexGrow: 0,
    maxHeight: 54,
  },
  environmentList: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  plantsList: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  messageState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyTitle: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 19,
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
  retryButton: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
})
