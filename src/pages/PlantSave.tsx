import React, { useState } from 'react'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { format } from 'date-fns'
import { SvgFromUri } from 'react-native-svg'
import { Button } from '../components/Button'
import { savePlant } from '../libs/storage'
import type { RootStackParamList } from '../routes/types'
import colors from '../styles/colors'
import fonts from '../styles/fonts'
import waterdrop from '../assets/waterdrop.png'

export function PlantSave() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { params } = useRoute<RouteProp<RootStackParamList, 'PlantSave'>>()
  const { plant } = params
  const [selectedDateTime, setSelectedDateTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios')
  const [saving, setSaving] = useState(false)

  function handleChangeTime(event: DateTimePickerEvent, dateTime?: Date) {
    if (Platform.OS === 'android') setShowDatePicker(false)
    if (event.type === 'set' && dateTime) setSelectedDateTime(dateTime)
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      await savePlant({ ...plant, dateTimeNotification: selectedDateTime })
      navigation.navigate('Confirmed', {
        title: 'Planta adicionada!',
        icon: 'smile',
        subtitle: `Vamos lembrar você de cuidar da ${plant.name}.`,
        titleButton: 'Ver meu jardim',
      })
    } catch {
      Alert.alert('Não foi possível salvar a planta', 'Tente novamente em instantes.')
    } finally {
      setSaving(false)
    }
  }

  const frequencyLabel = plant.frequency.repeat_every === 'day'
    ? 'Todos os dias'
    : `${plant.frequency.times} ${plant.frequency.times === 1 ? 'vez' : 'vezes'} por semana`

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.plantInfo}>
        <SvgFromUri uri={plant.photo} height={150} width={150} />
        <Text style={styles.plantName}>{plant.name}</Text>
        <Text style={styles.plantAbout}>{plant.about}</Text>
      </View>

      <View style={styles.controller}>
        <View style={styles.tipContainer}>
          <Image source={waterdrop} style={styles.tipImage} accessibilityLabel="gota d'água" />
          <Text style={styles.tipText}>{plant.water_tips}</Text>
        </View>

        <Text style={styles.frequency}>Frequência recomendada: {frequencyLabel}</Text>
        <Text style={styles.alertLabel}>Que horas você quer receber o lembrete?</Text>

        {showDatePicker ? (
          <DateTimePicker
            value={selectedDateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChangeTime}
          />
        ) : null}

        {Platform.OS === 'android' ? (
          <Button
            titleButton={`Horário: ${format(selectedDateTime, 'HH:mm')}`}
            onPress={() => setShowDatePicker(true)}
            style={styles.changeTime}
          />
        ) : null}

        <Button
          titleButton={saving ? 'Salvando…' : 'Adicionar ao meu jardim'}
          onPress={() => void handleSave()}
          disabled={saving}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.shape,
  },
  plantInfo: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingVertical: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controller: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 14,
  },
  plantName: {
    fontFamily: fonts.heading,
    fontSize: 25,
    color: colors.heading,
    marginTop: 14,
  },
  plantAbout: {
    textAlign: 'center',
    fontFamily: fonts.text,
    color: colors.body_dark,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  tipContainer: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue_light,
    padding: 16,
    gap: 12,
    marginBottom: 4,
  },
  tipImage: {
    width: 48,
    height: 48,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.text,
    color: colors.blue,
    fontSize: 14,
    lineHeight: 20,
  },
  frequency: {
    color: colors.body_dark,
    fontFamily: fonts.text,
    fontSize: 13,
    textAlign: 'center',
  },
  alertLabel: {
    textAlign: 'center',
    fontFamily: fonts.heading,
    color: colors.heading,
    fontSize: 15,
  },
  changeTime: {
    backgroundColor: colors.blue_light,
  },
  saveButton: {
    marginTop: 2,
  },
})
