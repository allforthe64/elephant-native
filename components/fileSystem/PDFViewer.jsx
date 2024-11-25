import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import PDFReader from 'react-native-pdf';
import * as FileSystem from 'expo-file-system';

const PDFViewer = ({ fileURL }) => {
  const [pdfUri, setPdfUri] = useState(null);
  const [loading, setLoading] = useState(true);

  const downloadPDF = async (url) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}temp.pdf`; // Temporary local path
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri
      );
  
      const { uri } = await downloadResumable.downloadAsync();
      return uri;
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (fileURL) {
        const fetchAndDisplayPDF = async () => {
            try {
              setLoading(true);
      
              // Download the PDF file to local storage
              const localUri = await downloadPDF(fileURL);
              setPdfUri(localUri);
            } catch (error) {
              console.error('Error loading PDF:', error);
            } finally {
              setLoading(false);
            }
          };
      
          fetchAndDisplayPDF();
    }
  }, [fileURL]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pdfUri && (
        <PDFReader
          source={{ uri: pdfUri }}
          style={styles.pdf}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PDFViewer;