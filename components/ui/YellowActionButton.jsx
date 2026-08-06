import React from 'react'
import { Text, View, StyleSheet, Platform } from 'react-native'
import AppPressable from './AppPressable'
import { Brand } from '../../constants/layout'

/**
 * Yellow icon+label action button that keeps label text inside the border.
 */
const YellowActionButton = ({
  icon,
  label,
  onPress,
  style,
  disabled = false,
  dimmed = false,
  elevated = false,
  testID,
  accessibilityLabel,
  iconSize = 28,
}) => {
  return (
    <AppPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      onPress={onPress}
      disabled={disabled || dimmed}
      activeOpacity={0.82}
      style={[
        styles.button,
        elevated && styles.elevated,
        dimmed && styles.dimmed,
        style,
      ]}
    >
      {icon ? (
        <View style={[styles.iconHolder, { width: iconSize, height: iconSize }]}>
          {icon}
        </View>
      ) : null}
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </AppPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Brand.yellow,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    width: '70%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  elevated: Platform.select({
    ios: {
      shadowColor: Brand.purple,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 6,
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
  dimmed: {
    opacity: 0.5,
  },
  iconHolder: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: Brand.purpleBright,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})

export default YellowActionButton
