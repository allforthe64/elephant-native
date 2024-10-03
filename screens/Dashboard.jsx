import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

//import stack navigator creation metho from @react-navigation/stack
import { createStackNavigator } from '@react-navigation/stack';

//import dashboard screens
import DashMain from './DashboardStackScreens/DashMain';
import CameraComponent from './DashboardStackScreens/CameraComponent';
import AudioRecorder from './DashboardStackScreens/AudioRecorder';
import Files from './DashboardStackScreens/Files'
import DocumentPickerComp from './DashboardStackScreens/DocumentPicker';
import Notepad from './DashboardStackScreens/Notes'
import QRScanner from './DashboardStackScreens/QRScanner'
/* import DocScanner from './DashboardStackScreens/DocScanner' */


//instantiate stack navigator
const Stack = createStackNavigator()

const Dashboard = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen name='DashMain' component={DashMain} options={{headerShown: false}}/>
        <Stack.Screen name='Files' component={Files} />
        <Stack.Screen name='Upload Files' component={DocumentPickerComp} />
        <Stack.Screen name='Camera' component={CameraComponent} />
        {/* <Stack.Screen name='Document Scanner' component={DocScanner} /> */}
        <Stack.Screen name='Record Audio' component={AudioRecorder} />
        <Stack.Screen name='Notepad' component={Notepad} />
        <Stack.Screen name='QR Scanner' component={QRScanner} />
    </Stack.Navigator>
  )
}

export default Dashboard