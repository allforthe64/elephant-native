import React from 'react'
import { View, Text } from 'react-native'

import { firebaseAuth } from '../../firebaseConfig'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'

const DashHeader = ({navigate}) => {
    const auth = firebaseAuth

  return (
    <View style={{width: '100%', paddingTop: 10, paddingLeft: 15, marginBottom: 10}}>
        <View style={{width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: '#593060', fontWeight: 800, fontSize: 30}}>Dashboard</Text>
            <AppPressable
              testID={TestIds.dashboard.signOut}
              accessibilityLabel="Sign Out"
              style={{marginLeft: 40}}
              onPress={async () => {
                await auth.signOut()
                navigate('Home')
              }}
            >
                <Text style={{color: 'red', fontSize: 18}}>Sign Out</Text>
            </AppPressable>
        </View>
    </View>
  )
}

export default DashHeader
