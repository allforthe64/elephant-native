//import gesture handler code for drawer navigator
import './gestureHandler';

import { StatusBar } from 'expo-status-bar';

//import SafeAreaProvider to provide safe area context to the app
import { SafeAreaProvider } from 'react-native-safe-area-context';

//import Main component
import Main from './screens/Main';

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
