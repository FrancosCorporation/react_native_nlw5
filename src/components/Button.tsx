import React from 'react'
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import colors from '../styles/colors'
import fonts from '../styles/fonts'

interface ButtonProps extends TouchableOpacityProps {
  titleButton: string
}

export function Button({ titleButton, style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      style={[styles.button, style]}
      {...rest}
    >
      <Text style={styles.buttonText}>{titleButton}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
})
