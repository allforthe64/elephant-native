import { StyleSheet, View, ScrollView } from 'react-native';
import { firebaseAuth } from '../../firebaseConfig';
import { useEffect } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import DashCollectContainer from '../../components/dashboard/DashCollectContainer';
import FileButtons from '../../components/dashboard/FileButtons';
import DashHeader from '../../components/dashboard/DashHeader';
import ContentShell from '../../components/ui/ContentShell';

export default function DashMain({navigation: { navigate }}) {
  const auth = firebaseAuth
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('Home')
    }
  }, [])

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ContentShell variant="content">
          <DashHeader navigate={navigate}/>
          <DashCollectContainer navigate={navigate}/>
          <FileButtons navigate={navigate}/>
        </ContentShell>
      </ScrollView>
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FFFCF6',
    flex: 1
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 32,
    width: '100%',
    flexGrow: 1,
  },
});
