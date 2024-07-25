//import gesture handler code for drawer navigator
import './gestureHandler';

import { StatusBar } from 'expo-status-bar';

//import SafeAreaProvider to provide safe area context to the app
import { SafeAreaProvider } from 'react-native-safe-area-context';

//import AuthContextProvider to provide auth context to the app
import { AuthContextProvider } from './firebase/auth';

//import Main component
import Main from './screens/Main';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <Main />
        <StatusBar style="auto" />
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}
