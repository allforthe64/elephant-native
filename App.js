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

import * as Sentry from '@sentry/react-native';
import CrashFallback from './components/ui/CrashFallback';

Sentry.init({
  dsn: 'https://d460ada50918758584a197b5b1d0793e@o4507346968772608.ingest.us.sentry.io/4507346971328512',
  environment: __DEV__ ? 'development' : 'production',
});

function App() {
  return (
    <SafeAreaProvider>
      <Sentry.ErrorBoundary fallback={CrashFallback}>
        <ToastProvider placement='top' offsetTop={150}>
          <AuthContextProvider>
            <Main />
            <StatusBar style="auto" />
          </AuthContextProvider>
        </ToastProvider>
      </Sentry.ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
