import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import AppPressable from './AppPressable'

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
      style={[
        styles.button,
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
    backgroundColor: '#FFE562',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    width: '70%',
    maxWidth: 420,
    alignSelf: 'center',
  },
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
    color: '#9F37B0',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})

export default YellowActionButton
