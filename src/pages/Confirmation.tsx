import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button } from '../components/Button'
import colors from '../styles/colors'
import fonts from '../styles/fonts'
import type { RootStackParamList } from '../routes/types'

const emojis = {
  hub: '🌱',
  smile: '😊',
}

export function Confirmation() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { params } = useRoute<RouteProp<RootStackParamList, 'Confirmed'>>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji} accessibilityLabel="planta">{emojis[params.icon]}</Text>
        <Text style={styles.title}>{params.title}</Text>
        <Text style={styles.subtitle}>{params.subtitle}</Text>
        <Button
          titleButton={params.titleButton}
          onPress={() => navigation.navigate('PlantSelect')}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 62,
    marginBottom: 22,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 35,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 32,
  },
})
