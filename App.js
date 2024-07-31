//import gesture handler code for drawer navigator
import './gestureHandler';

import { StatusBar } from 'expo-status-bar';

//import SafeAreaProvider to provide safe area context to the app
import { SafeAreaProvider } from 'react-native-safe-area-context';

//import AuthContextProvider to provide auth context to the app
import { AuthContextProvider } from './firebase/auth';

//import ToastProvider for notifications
import { ToastProvider } from 'react-native-toast-notifications';

//import Main component
import Main from './screens/Main';

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider placement='top' offsetTop={150} >
        <AuthContextProvider>
          <Main />
          <StatusBar style="auto" />
        </AuthContextProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
