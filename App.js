//import gesture handler code for drawer navigator
import './gestureHandler';

import { StatusBar } from 'expo-status-bar';

//import SafeAreaProvider to provide safe area context to the app
import { SafeAreaProvider } from 'react-native-safe-area-context';

//import AuthContextProvider to provide auth context to the app
import { AuthContextProvider } from './firebase/auth';
import { QueContextProvider } from './context/QueContext';

//import ToastProvider for notifications
import { ToastProvider } from 'react-native-toast-notifications';

//import Main component
import Main from './screens/Main';

//import and initialize react-native-exception-handler(s) and Sentry packages
import { setNativeExceptionHandler, setJSExceptionHandler } from 'react-native-exception-handler';
import * as Sentry from '@sentry/react-native';


Sentry.init({
  dsn: 'https://d460ada50918758584a197b5b1d0793e@o4507346968772608.ingest.us.sentry.io/4507346971328512',
});


//set a handler to take care of all native errors
setNativeExceptionHandler((errorString) => {
  Sentry.captureException(new Error(errorString))
});


//set a handler to take care of all JS errors
setJSExceptionHandler((error, isFatal) => {
  const sentryId = Sentry.captureException(new Error(error.name));
})

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider placement='top' offsetTop={150} >
        <AuthContextProvider>
          <QueContextProvider>
            <Main />
            <StatusBar style="auto" />
          </QueContextProvider>
        </AuthContextProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
