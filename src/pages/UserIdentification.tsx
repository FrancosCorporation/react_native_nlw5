import React, { useState } from 'react'
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Button } from '../components/Button'
import colors from '../styles/colors'
import fonts from '../styles/fonts'
import type { RootStackParamList } from '../routes/types'

const USER_STORAGE_KEY = '@react_native_nlw5:user'

export function UserIdentification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [name, setName] = useState('')
  const [focused, setFocused] = useState(false)

  async function saveName() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      Alert.alert('Como podemos chamar você?', 'Digite seu nome para continuar.')
      return
    }

    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, trimmedName)
      navigation.navigate('Confirmed', {
        title: `Prazer, ${trimmedName}!`,
        icon: 'hub',
        subtitle: 'Vamos preparar um cantinho mais verde para você.',
        titleButton: 'Escolher plantas',
      })
    } catch {
      Alert.alert('Não foi possível salvar seu nome', 'Tente novamente em instantes.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.emoji} accessibilityLabel="planta em vaso">🌿</Text>
          <Text style={styles.title}>Como podemos chamar você?</Text>
          <Text style={styles.subtitle}>Seu nome deixa os lembretes mais pessoais.</Text>
          <TextInput
            accessibilityLabel="Seu nome"
            autoCapitalize="words"
            autoComplete="name"
            maxLength={40}
            onBlur={() => setFocused(false)}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onSubmitEditing={() => void saveName()}
            placeholder="Digite seu nome"
            placeholderTextColor={colors.body_light}
            returnKeyType="done"
            style={[styles.input, focused && styles.inputFocused]}
            value={name}
          />
          <Button titleButton="Continuar" onPress={() => void saveName()} style={styles.button} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 20,
  },
  title: {
    color: colors.heading,
    fontFamily: fonts.heading,
    fontSize: 25,
    lineHeight: 33,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    minHeight: 56,
    marginTop: 34,
    borderBottomWidth: 1,
    borderColor: colors.gray,
    color: colors.heading,
    fontFamily: fonts.text,
    fontSize: 18,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: colors.green,
    borderBottomWidth: 2,
  },
  button: {
    width: Math.min(Dimensions.get('window').width - 64, 360),
    marginTop: 28,
  },
})
