import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faMicrophone, faQrcode, faPencil, faFile } from '@fortawesome/free-solid-svg-icons';

export default function DashCollectContainer({ navigate }) {

  return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>      
                <TouchableOpacity onPress={() => navigate('Document Scanner')} style={styles.buttonWrapper}>
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faFile} size={30} style={{color: '#593060'}}/>
                  </View>
                    <Text style={styles.input}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigate('Camera')} style={styles.buttonWrapper}>
                    <View style={styles.iconContainer}>
                      <FontAwesomeIcon icon={faCamera} size={30} style={{color: '#593060'}}/>
                    </View>
                    <Text style={styles.input}>Cam</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => navigate('QR Scanner')} style={styles.buttonWrapper}>
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faQrcode} size={30} style={{color: '#593060'}}/>
                  </View>
                  <Text style={styles.input}>QR</Text>
                </TouchableOpacity> 
                <TouchableOpacity onPress={() => navigate('Record Audio')} style={styles.buttonWrapper}>
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faMicrophone} size={30} style={{color: '#593060'}}/>
                  </View>
                    <Text style={styles.input}>Mic</Text>
                </TouchableOpacity>   
            </View>
            <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity onPress={() => navigate('Notepad')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', width: '96%', backgroundColor: '#DDCADB', marginTop: '2%', borderRadius: 10, paddingTop: 6, paddingBottom: 6, paddingLeft: '15%'}}>
                  <View style={styles.iconContainerWhiteBG}>
                    <FontAwesomeIcon icon={faPencil} size={30} style={{color: '#593060'}}/>
                  </View>
                    <Text style={{textAlign: 'center', fontSize: 22, paddingTop: '1%', color: '#593060', marginLeft: '10%'}}>Notes</Text>
              </TouchableOpacity>
            </View>
            <StatusBar style='auto' />
        </View>
    
  );
}

const styles = StyleSheet.create({

  mainContainer: {
    width: '100%'
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row', 
    justifyContent: 'space-around',
    paddingTop: '4%'
  },
  column: {
    width: '100%',
    paddingTop: '2%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },    
  bigHeader: {
    color: 'white',
    fontSize: 45,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '2.5%'
  },
  subheading: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18
  },
  buttonWrapper: {
    width: '48%',
    height: 125,
    backgroundColor: '#593060',
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    /* padding: 8, */
    textAlign: 'center',
    fontSize: 22,
    paddingTop: '1%',
    color: 'white'
  },
  iconContainer: {
    backgroundColor: '#DDCADB', 
    width: '40%', 
    height: 75, 
    borderRadius: 100, 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  iconContainerWhiteBG: {
    backgroundColor: 'white', 
    width: '23%', 
    height: 70, 
    borderRadius: 100, 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
  }
});