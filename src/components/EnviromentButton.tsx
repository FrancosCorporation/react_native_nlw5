import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { PressableProps } from 'react-native'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

interface EnvironmentButtonProps extends PressableProps {
  title: string
  active?: boolean
}

export function EnviromentButton({ title, active = false, ...rest }: EnvironmentButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.container, active && styles.containerActive]}
      {...rest}
    >
      <Text style={[styles.text, active && styles.textActive]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.shape,
    height: 40,
    minWidth: 76,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  containerActive: {
    backgroundColor: colors.green_light,
  },
  text: {
    color: colors.heading,
    fontFamily: fonts.text,
  },
  textActive: {
    fontFamily: fonts.heading,
    color: colors.green,
  },
})
