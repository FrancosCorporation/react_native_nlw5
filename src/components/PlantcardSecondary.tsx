import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { PressableProps } from 'react-native'
import { SvgFromUri } from 'react-native-svg'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { Feather } from '@expo/vector-icons'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

interface PlantProps extends PressableProps {
  data: {
    id?: string | number
    name: string
    photo: string
    hour?: string
  }
  handleRemove: () => void
}

export function PlantcardSecondary({ data, handleRemove, ...rest }: PlantProps) {
  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remover ${data.name}`}
          style={styles.buttonRemove}
          onPress={handleRemove}
        >
          <Feather name="trash-2" size={24} color={colors.white} />
          <Text style={styles.removeLabel}>Remover</Text>
        </Pressable>
      )}
    >
      <Pressable accessibilityRole="button" style={styles.container} {...rest}>
        <SvgFromUri uri={data.photo} width={50} height={50} />
        <Text style={styles.title}>{data.name}</Text>
        <View style={styles.details}>
          <Text style={styles.timeLabel}>Regar às</Text>
          <Text style={styles.time}>{data.hour ?? '--:--'}</Text>
        </View>
      </Pressable>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.shape,
    marginVertical: 5,
  },
  title: {
    flex: 1,
    marginLeft: 10,
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.heading,
  },
  details: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    fontSize: 13,
    fontFamily: fonts.text,
    color: colors.body_light,
  },
  time: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: fonts.heading,
    color: colors.body_dark,
  },
  buttonRemove: {
    minWidth: 88,
    marginVertical: 5,
    marginLeft: 8,
    borderRadius: 18,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  removeLabel: {
    color: colors.white,
    fontFamily: fonts.text,
    fontSize: 11,
  },
})
