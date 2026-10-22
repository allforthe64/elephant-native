import React, { useContext, useEffect } from 'react';
import { Linking } from 'react-native'

//import drawer navigator from @react-navigation/drawer
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native"; //import NavigationContainer (is a required as a dependency of the drawerNavigator)

//Screen Component imports
import Home from './Home';
import Dashboard from './Dashboard';
import Contact from './Contact';
import About from './About';
import Auth from './Auth';
import ThankYou from './ThankYou';
import FAQs from './FAQs';
import TOSMain from './TOSMain';
import PrivacyMain from './PrivacyMain';

//import firebase auth object/AuthContext/onAuthStateChanged function
import { AuthContext } from '../firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '../firebaseConfig';

import { useUploadQueueWorker } from '../hooks/useUploadQueueWorker';

//instantiate drawer navigator in Drawer variable
const Drawer = createDrawerNavigator()

const Main = () => {
  const {authUser, setAuthUser} = useContext(AuthContext)

  useUploadQueueWorker()

  //when the auth state changes, pass the user object from firbaseAuth object into AuthContext
  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (user) => {
      setAuthUser(user)
    })
  }, [])

  return (
    <NavigationContainer>
        <Drawer.Navigator initialRouteName='Home'>
            <Drawer.Screen name='Home' component={Home} options={authUser && {drawerItemStyle: {display: 'none'}, title: ''}} />
            <Drawer.Screen name="Sign In/Sign Up" component={Auth} options={authUser && {drawerItemStyle: {display: 'none'}, title: ''}}/>
            <Drawer.Screen name='About' component={About} options={{ drawerItemStyle: { display: 'none' }, title: 'About' }} />
            <Drawer.Screen name='FAQs' component={FAQs} />
            <Drawer.Screen name='Contact' component={Contact} />
            <Drawer.Screen name="Dashboard" component={Dashboard} options={!authUser && {drawerItemStyle: {display: 'none'}, title: ''}} />
            <Drawer.Screen name="Settings" component={Home} listeners={{
              drawerItemPress: (e) => {
                e.preventDefault()

                Linking.openURL('https://myelephantapp.com/settings')
              },
            }} />
            <Drawer.Screen name='Privacy Policy' component={PrivacyMain} />
            <Drawer.Screen name='Terms Of Service' component={TOSMain} />
            <Drawer.Screen name="Registration Complete" component={ThankYou} options={{drawerItemStyle: {height: 0}, title: ''}}/>
        </Drawer.Navigator>
    </NavigationContainer>
  )
}

export default Main
