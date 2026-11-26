import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import DashMain from './DashboardStackScreens/DashMain'
import CameraComponent from './DashboardStackScreens/CameraComponent'
import AudioRecorder from './DashboardStackScreens/AudioRecorder'
import Files from './DashboardStackScreens/Files'
import DocumentPickerComp from './DashboardStackScreens/DocumentPicker'
import Notepad from './DashboardStackScreens/Notes'
import QRScanner from './DashboardStackScreens/QRScanner'
import DocScanner from './DashboardStackScreens/DocScanner'
import SubscriptionRequired from '../components/dashboard/SubscriptionRequired'
import { useUserDoc } from '../hooks/useUserDoc'

const Stack = createStackNavigator()

const Dashboard = () => {
  const { userDoc, loading } = useUserDoc()

  if (loading) {
    return <SubscriptionRequired loading />
  }

  if (!userDoc?.hasPaid) {
    return <SubscriptionRequired />
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="DashMain" component={DashMain} options={{ headerShown: false }} />
      <Stack.Screen name="Files" component={Files} />
      <Stack.Screen name="Upload Files" component={DocumentPickerComp} />
      <Stack.Screen name="Camera" component={CameraComponent} />
      <Stack.Screen name="Document Scanner" component={DocScanner} />
      <Stack.Screen name="Record Audio" component={AudioRecorder} />
      <Stack.Screen name="Notepad" component={Notepad} />
      <Stack.Screen name="QR Scanner" component={QRScanner} />
    </Stack.Navigator>
  )
}

export default Dashboard
