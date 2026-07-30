import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { firebaseAuth } from '../../firebaseConfig'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

const DashHeader = ({navigate}) => {
    const auth = firebaseAuth
    const { isTablet } = useResponsiveLayout()

  return (
    <View style={tabletStyle(isTablet, styles.wrap, tabletStyles.wrap)}>
        <View style={styles.row}>
            <Text style={tabletStyle(isTablet, styles.title, tabletStyles.title)}>Dashboard</Text>
            <AppPressable
              testID={TestIds.dashboard.signOut}
              accessibilityLabel="Sign Out"
              style={styles.signOut}
              onPress={async () => {
                await auth.signOut()
                navigate('Home')
              }}
            >
                <Text style={styles.signOutText}>Sign Out</Text>
            </AppPressable>
        </View>
    </View>
  )
}

export default DashHeader

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingTop: 10,
    paddingLeft: 15,
    marginBottom: 10,
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  title: {
    color: '#593060',
    fontWeight: '800',
    fontSize: 30,
  },
  signOut: {
    marginLeft: 40,
  },
  signOutText: {
    color: 'red',
    fontSize: 18,
  },
})

const tabletStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
  },
})
