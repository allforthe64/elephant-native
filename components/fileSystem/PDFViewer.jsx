import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import PDFReader from 'react-native-pdf';
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { downloadPdf, forgetPdf } from '../../utils/pdfCache';
import YellowButton from '../ui/YellowButton';

const PDFViewer = ({ fileURL }) => {
  const { isTablet, contentFill } = useResponsiveLayout();
  const [pdfUri, setPdfUri] = useState(null);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!fileURL) return;
    let cancelled = false;
    setPdfUri(null);
    setFailed(false);
    setProgress(0);

    const { promise, unsubscribe } = downloadPdf(fileURL, (p) => {
      if (!cancelled) setProgress(p);
    });
    promise
      .then((uri) => { if (!cancelled) setPdfUri(uri); })
      .catch((error) => {
        console.error('Error loading PDF:', error);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [fileURL, attempt]);

  const retry = async () => {
    await forgetPdf(fileURL);
    setAttempt((n) => n + 1);
  };

  if (failed) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Couldn't open this document.</Text>
        <YellowButton size="sm" label="Retry" onPress={retry} />
      </View>
    );
  }

  if (!pdfUri) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#593060" />
        {progress > 0 ? <Text style={styles.message}>{Math.round(progress * 100)}%</Text> : null}
      </View>
    );
  }

  return (
    <View style={tabletStyle(isTablet, styles.container, contentFill)}>
      <PDFReader
        source={{ uri: pdfUri }}
        style={styles.pdf}
        trustAllCerts={false}
        onError={(error) => {
          console.error('Error rendering PDF:', error);
          setFailed(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  message: { color: '#593060', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default PDFViewer;
