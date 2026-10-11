import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { PressableProps } from 'react-native'
import { SvgFromUri } from 'react-native-svg'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

interface PlantProps extends PressableProps {
  data: {
    name: string
    photo: string
  }
}

export function PlantcardPrimary({ data, ...rest }: PlantProps) {
  return (
    <Pressable accessibilityRole="button" style={styles.container} {...rest}>
      <SvgFromUri uri={data.photo} width={70} height={70} />
      <Text style={styles.text}>{data.name}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxWidth: '45%',
    minHeight: 130,
    backgroundColor: colors.shape,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  text: {
    color: colors.green_dark,
    fontFamily: fonts.heading,
    marginTop: 12,
    textAlign: 'center',
  },
})
