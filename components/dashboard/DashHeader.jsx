import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import { firebaseAuth } from '../../firebaseConfig'

const DashHeader = ({navigate}) => {

    const auth = firebaseAuth

  return (
    <View style={{width: '100%', paddingTop: 10, paddingLeft: 15, marginBottom: 10}}>
        <Text style={{color: '#593060', fontWeight: 800, fontSize: 30}}>My Dashboard</Text>
        <View style={{width: '100%', display: 'flex', flexDirection: 'row'}}>
            <Text style={{color: '#593060', fontWeight: 400, fontSize: 18}}>Check out your quick actions</Text>
            <TouchableOpacity style={{marginLeft: 40}} onPress={async () => {
                auth.signOut()
                navigate('Home')
            }}>
                <Text style={{color: 'red', fontSize: 18}}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default DashHeader