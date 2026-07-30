import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faMicrophone, faQrcode, faPencil, faFile } from '@fortawesome/free-solid-svg-icons';
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

export default function DashCollectContainer({ navigate }) {
  const { isTablet, isLargeTablet } = useResponsiveLayout()
  const iconSize = isTablet ? 34 : 30

  const tile = (testID, label, a11y, route, icon) => (
    <AppPressable
      testID={testID}
      accessibilityLabel={a11y}
      onPress={() => navigate(route)}
      style={tabletStyle(isTablet, styles.buttonWrapper, tabletStyles.buttonWrapper)}
    >
      <View style={tabletStyle(isTablet, styles.iconContainer, tabletStyles.iconContainer)}>
        <FontAwesomeIcon icon={icon} size={iconSize} style={{color: '#593060'}}/>
      </View>
      <Text style={styles.input}>{label}</Text>
    </AppPressable>
  )

  return (
        <View style={tabletStyle(isTablet, styles.mainContainer, tabletStyles.mainContainer)}>
            <Text style={tabletStyle(isTablet, styles.quickFilesHeading, tabletStyles.quickFilesHeading)}>Collect:</Text>

            {isTablet ? (
              <View style={isLargeTablet ? tabletStyles.gridLarge : tabletStyles.grid}>
                {tile(TestIds.dashboard.scan, 'Scan', 'Document Scanner', 'Document Scanner', faFile)}
                {tile(TestIds.dashboard.camera, 'Cam', 'Camera', 'Camera', faCamera)}
                {tile(TestIds.dashboard.qr, 'QR', 'QR Scanner', 'QR Scanner', faQrcode)}
                {tile(TestIds.dashboard.mic, 'Mic', 'Record Audio', 'Record Audio', faMicrophone)}
              </View>
            ) : (
              <>
                <View style={styles.container}>
                  {tile(TestIds.dashboard.scan, 'Scan', 'Document Scanner', 'Document Scanner', faFile)}
                  {tile(TestIds.dashboard.camera, 'Cam', 'Camera', 'Camera', faCamera)}
                </View>
                <View style={styles.container}>
                  {tile(TestIds.dashboard.qr, 'QR', 'QR Scanner', 'QR Scanner', faQrcode)}
                  {tile(TestIds.dashboard.mic, 'Mic', 'Record Audio', 'Record Audio', faMicrophone)}
                </View>
              </>
            )}

            <View style={tabletStyle(isTablet, styles.notesRow, tabletStyles.notesRow)}>
              <AppPressable
                testID={TestIds.dashboard.notes}
                accessibilityLabel="Notes"
                onPress={() => navigate('Notepad')}
                style={tabletStyle(isTablet, styles.notesButton, tabletStyles.notesButton)}
              >
                  <View style={tabletStyle(isTablet, styles.iconContainerWhiteBG, tabletStyles.iconContainerWhiteBG)}>
                    <FontAwesomeIcon icon={faPencil} size={iconSize} style={{color: '#593060'}}/>
                  </View>
                    <Text style={tabletStyle(isTablet, styles.notesLabel, tabletStyles.notesLabel)}>Notes</Text>
              </AppPressable>
            </View>
            <StatusBar style='auto' />
        </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: '2%'
  },
  buttonWrapper: {
    width: '48%',
    height: 115,
    backgroundColor: '#593060',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    textAlign: 'center',
    fontSize: 18,
    paddingTop: '1%',
    color: 'white'
  },
  iconContainer: {
    backgroundColor: '#DDCADB',
    width: '39%',
    height: 65,
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconContainerWhiteBG: {
    backgroundColor: 'white',
    width: '23%',
    height: 65,
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickFilesHeading: {
    fontSize: 20,
    color: '#593060',
    fontWeight: '500',
    marginTop: '2%',
    paddingLeft: 5
  },
  notesRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  notesButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '96%',
    backgroundColor: '#DDCADB',
    marginTop: '2%',
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: '15%',
  },
  notesLabel: {
    textAlign: 'center',
    fontSize: 22,
    paddingTop: '1%',
    color: '#593060',
    marginLeft: '10%',
  },
});

const tabletStyles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  quickFilesHeading: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 4,
    fontSize: 22,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridLarge: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  buttonWrapper: {
    width: '48%',
    height: 140,
    marginBottom: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
  },
  iconContainerWhiteBG: {
    width: 64,
    height: 64,
  },
  notesRow: {
    marginTop: 8,
  },
  notesButton: {
    width: '100%',
    paddingLeft: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  notesLabel: {
    marginLeft: 24,
    paddingTop: 0,
    fontSize: 24,
  },
})
