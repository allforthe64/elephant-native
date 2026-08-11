import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faMicrophone, faQrcode, faPencil, faFile } from '@fortawesome/free-solid-svg-icons';
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'
import { Brand } from '../../constants/layout'

const tileShadow = Platform.select({
  ios: {
    shadowColor: Brand.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
  default: {},
})

const notesShadow = Platform.select({
  ios: {
    shadowColor: Brand.purple,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  android: {
    elevation: 4,
  },
  default: {},
})

export default function DashCollectContainer({ navigate }) {
  const { isTablet, isLargeTablet, isLandscape } = useResponsiveLayout()
  const iconSize = isTablet ? 34 : 30
  const landscapeGrid = isTablet && isLandscape

  const tile = (testID, label, a11y, route, icon) => (
    <Pressable
      testID={testID}
      accessibilityLabel={a11y}
      accessibilityRole="button"
      onPress={() => navigate(route)}
      style={({ pressed }) => [
        tabletStyle(isTablet, styles.buttonWrapper, tabletStyles.buttonWrapper),
        landscapeGrid && tabletStyles.buttonWrapperLandscape,
        tileShadow,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={tabletStyle(isTablet, styles.iconContainer, tabletStyles.iconContainer)}>
        <FontAwesomeIcon icon={icon} size={iconSize} style={{ color: Brand.purple }} />
      </View>
      <Text style={styles.input}>{label}</Text>
    </Pressable>
  )

  return (
    <View style={tabletStyle(isTablet, styles.mainContainer, tabletStyles.mainContainer)}>
      <Text style={tabletStyle(isTablet, styles.quickFilesHeading, tabletStyles.quickFilesHeading)}>
        Collect:
      </Text>

      {isTablet ? (
        <View style={[
          isLargeTablet ? tabletStyles.gridLarge : tabletStyles.grid,
          landscapeGrid && tabletStyles.gridLandscape,
        ]}>
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
        <Pressable
          testID={TestIds.dashboard.notes}
          accessibilityLabel="Notes"
          accessibilityRole="button"
          onPress={() => navigate('Notepad')}
          style={({ pressed }) => [
            tabletStyle(isTablet, styles.notesButton, tabletStyles.notesButton),
            notesShadow,
            pressed && styles.notesPressed,
          ]}
        >
          <View
            style={tabletStyle(
              isTablet,
              styles.iconContainerWhiteBG,
              tabletStyles.iconContainerWhiteBG
            )}
          >
            <FontAwesomeIcon icon={faPencil} size={iconSize} style={{ color: Brand.purple }} />
          </View>
          <Text style={tabletStyle(isTablet, styles.notesLabel, tabletStyles.notesLabel)}>
            Notes
          </Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: '2%',
  },
  buttonWrapper: {
    width: '48%',
    height: 115,
    backgroundColor: Brand.purple,
    borderRadius: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  input: {
    textAlign: 'center',
    fontSize: 18,
    paddingTop: '1%',
    color: 'white',
  },
  iconContainer: {
    backgroundColor: Brand.lavender,
    width: '39%',
    height: 65,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerWhiteBG: {
    backgroundColor: 'white',
    width: '23%',
    height: 65,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickFilesHeading: {
    fontSize: 20,
    color: Brand.purple,
    fontWeight: '500',
    marginTop: '2%',
    paddingLeft: 5,
  },
  notesRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '96%',
    backgroundColor: Brand.lavender,
    marginTop: '2%',
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: '15%',
  },
  notesPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  notesLabel: {
    textAlign: 'center',
    fontSize: 22,
    paddingTop: '1%',
    color: Brand.purple,
    marginLeft: '10%',
  },
})

const tabletStyles = StyleSheet.create({
  mainContainer: {
    width: '100%',
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
  buttonWrapperLandscape: {
    width: '23%',
    flexGrow: 1,
    flexShrink: 1,
    height: 128,
    marginBottom: 0,
  },
  gridLandscape: {
    flexWrap: 'nowrap',
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
