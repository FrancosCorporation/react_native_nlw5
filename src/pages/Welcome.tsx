import React from 'react'
import { Image, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button } from '../components/Button'
import fonts from '../styles/fonts'
import colors from '../styles/colors'
import wateringImg from '../assets/watering.png'
import type { RootStackParamList } from '../routes/types'

export function Welcome() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { width } = useWindowDimensions()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text accessibilityLabel="folha" style={styles.brandLeaf}>✦</Text>
          </View>
          <Text style={styles.brandName}>Plant Manager</Text>
        </View>

        <Image
          source={wateringImg}
          style={[styles.image, { height: Math.min(width * 0.78, 340) }]}
          resizeMode="contain"
          accessibilityLabel="Pessoa cuidando de uma planta"
        />

        <View style={styles.message}>
          <Text style={styles.title}>Mais verde.{ '\n' }Mais cuidado.</Text>
          <Text style={styles.subtitle}>
            Organize suas plantas e receba lembretes para regar cada uma no momento certo.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            titleButton="Começar"
            onPress={() => navigation.navigate('UserIdentification')}
            accessibilityHint="Inicia a configuração do seu jardim"
          />
          <Text style={styles.privacyNote}>Suas plantas ficam salvas neste aparelho.</Text>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green_light,
  },
  brandLeaf: {
    color: colors.green_dark,
    fontSize: 19,
  },
  brandName: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 17,
  },
  image: {
    width: '100%',
    alignSelf: 'center',
  },
  message: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  privacyNote: {
    color: colors.body_light,
    fontFamily: fonts.text,
    fontSize: 12,
    textAlign: 'center',
  },
})
