import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { firebaseAuth } from '../../firebaseConfig';
import DashCollectContainer from '../../components/dashboard/DashCollectContainer';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFolder, faBox, faFile } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/* import * as Sentry from '@sentry/react-native'; */

export default function DashMain({navigation: { navigate }}) {


  const auth = firebaseAuth


  //if the user is not logged in, take them back to the homepage
  useEffect(() => {
    if (!auth.currentUser) {
      navigate('Home')
    }
  }, [])

  const insets = useSafeAreaInsets()

  return (
    <View>
        <Image style={styles.bgImg} source={require('../../assets/elephant_bg.jpg')} />
        <View style={styles.buttonContainer}>
          <View style={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-around', height: 600}}>
            <DashCollectContainer navigate={navigate}/>
            <View style={{display: 'flex', flexDirection: 'column', width:'55%'}}>
              <View style={styles.wrapperContainer}>
                <View style={styles.buttonWrapper}>
                  <TouchableOpacity onPress={() => navigate('Files', {staging: false})} style={styles.file}>
                      <Text style={styles.input}>My Files</Text>
                      <FontAwesomeIcon icon={faFolder} size={30} style={{marginLeft: '3%', marginTop: '1%'}}/>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.wrapperContainer}>
                <View style={{width: '80%',
                    borderColor: '#777',
                    borderRadius: 25,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    paddingTop: '2%',
                    paddingBottom: '2%',
                    marginBottom: '8%',
                    marginLeft: '2%'}}>
                  <TouchableOpacity onPress={() => navigate('Upload A File')} style={styles.file}>
                      <Text style={styles.input}>Upload Doc</Text>
                      <FontAwesomeIcon icon={faFile} size={30} style={{marginLeft: '3%', marginTop: '1%'}}/>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.wrapperContainer}>
                <View style={{width: '80%',
                    borderColor: '#777',
                    borderRadius: 25,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    paddingTop: '2%',
                    paddingBottom: '2%',
                    marginBottom: '8%',
                    marginLeft: '2%'}}>
                  <TouchableOpacity onPress={() => navigate('Files', {staging: true})} style={styles.file}>
                      <Text style={styles.input}>Staging</Text>
                      <FontAwesomeIcon icon={faBox} size={30} style={{marginLeft: '3%', marginTop: '1%'}}/>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}}>
            <View style={styles.buttonWrapperLogout}>
                  <TouchableOpacity onPress={async () => {
                    auth.signOut()
                    navigate('Home')
                    }}>
                      <Text style={styles.inputLogout}>Sign Out</Text>
                  </TouchableOpacity>
            </View>
          </View>
      </View>
      <StatusBar style='auto' />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  buttonContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, .6)',
    position: 'absolute',
  },
  bigHeader: {
    color: 'white',
    fontSize: 45,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '5%'
  },
  subheading: {
    color: 'white',
    textAlign: 'center',
    fontSize: 35,
    fontWeight: '600',
    marginBottom: '10%'
  },
  wrapperContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingTop: '10%'
  },
  buttonWrapper: {
    width: '80%',
    borderColor: '#777',
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    paddingTop: '2%',
    paddingBottom: '2%',
    marginTop: '10%',
    marginBottom: '8%',
    marginLeft: '2%'
  },
  buttonWrapperLogout: {
    width: '45%',
    borderRadius: 25,
    backgroundColor: 'red',
    borderWidth: 1,
    paddingTop: '2%',
    paddingBottom: '2%',
  },
  input: {
    paddingTop: 4,
    textAlign: 'left',
    fontSize: 18,
    marginRight: '3%'
  },
  inputLogout: {
    textAlign: 'center',
    fontSize: 12,
    width: '100%',
    color: 'white'
  },
  file: {
    display: 'flex', 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'center'},
  bgImg: {
    objectFit: 'scale-down',
    opacity: .9,
  },
});