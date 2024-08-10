import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faMicrophone, faQrcode, faPencil, faFile } from '@fortawesome/free-solid-svg-icons';

export default function DashCollectContainer({ navigate }) {

  return (
        <View style={styles.container}>

            <View style={styles.column}>
                <View style={styles.buttonWrapper}>
                  <TouchableOpacity onPress={() => navigate('Camera')} style={{display: 'flex', flexDirection: 'coulumn', alignItems: 'center'}}>
                      <FontAwesomeIcon icon={faCamera} size={30} />
                      <Text style={styles.input}>Cam</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity onPress={() => navigate('Record Audio')} style={{display: 'flex', flexDirection: 'coulumn', alignItems: 'center'}}>
                      <FontAwesomeIcon icon={faMicrophone} size={30}/>
                        <Text style={styles.input}>Mic</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity onPress={() => navigate('QR Scanner')} style={{display: 'flex', flexDirection: 'coulumn', alignItems: 'center'}}>
                      <FontAwesomeIcon icon={faQrcode} size={30}/>
                        <Text style={styles.input}>QR</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity onPress={() => navigate('Notepad')} style={{display: 'flex', flexDirection: 'coulumn', alignItems: 'center'}}>
                      <FontAwesomeIcon icon={faPencil} size={30}/>
                        <Text style={styles.input}>Notes</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonWrapper}>
                    <TouchableOpacity onPress={() => navigate('Document Scanner')} style={{display: 'flex', flexDirection: 'coulumn', alignItems: 'center'}}>
                      <FontAwesomeIcon icon={faFile} size={30}/>
                        <Text style={styles.input}>Scan</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <StatusBar style='auto' />
        </View>
    
  );
}

const styles = StyleSheet.create({

  container: {
    height: '100%',
    width: '25%',
    display: 'flex',
    flexDirection: 'row', 
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    /* padding: 8, */
    textAlign: 'center',
    fontSize: 18,
    paddingTop: '1%',
  }
});