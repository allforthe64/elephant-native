import React from 'react'
import { View, Text, Image, Pressable, Modal, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faImage, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Video } from 'expo-av'
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view'
import PDFViewer from '../PDFViewer'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'

const Placeholder = ({ label }) => (
  <View style={{ height: 150 }}>
    <FontAwesomeIcon icon={faImage} color="#593060" size={125} />
    <Text style={styles.placeholderText}>{label}</Text>
  </View>
)

/** Inline preview for images, PDFs, Word documents (as converted PDFs) and videos. */
const FilePreview = ({ kind, fileURL, convertedPDFURL, conversionFailed, onExpand }) => {
  if (kind === 'image') {
    return (
      <View style={styles.row}>
        {fileURL ? (
          <Pressable width={300} height={150} onPress={() => onExpand('img')}>
            <Image source={{ uri: fileURL }} style={styles.fill} />
          </Pressable>
        ) : (
          <Placeholder label="Fetching Image..." />
        )}
      </View>
    )
  }

  if (kind === 'pdf' || kind === 'word') {
    const url = kind === 'pdf' ? fileURL : convertedPDFURL
    const label = kind === 'word' && conversionFailed ? 'Preview unavailable' : `Fetching ${kind === 'pdf' ? 'PDF' : 'Document'}...`
    return (
      <View style={styles.row}>
        {url ? (
          <View width={300} height={300}>
            <Pressable style={{ width: '100%', height: '100%' }} onPress={() => onExpand(kind)}>
              <PDFViewer fileURL={url} />
            </Pressable>
          </View>
        ) : (
          <Placeholder label={label} />
        )}
      </View>
    )
  }

  if (kind === 'video') {
    return (
      <View style={[styles.row, styles.videoRow]}>
        {fileURL ? (
          <Video
            style={{ flex: 1, alignSelf: 'stretch', height: '100%' }}
            source={{ uri: fileURL }}
            useNativeControls
            resizeMode="contain"
            isLooping
            onError={(error) => alert(error)}
          />
        ) : (
          <Placeholder label="Fetching Video..." />
        )}
      </View>
    )
  }

  return null
}

/** Full-screen zoomable image or PDF, opened by tapping a preview. */
export const ExpandedPreview = ({ kind, fileURL, convertedPDFURL, onClose }) => {
  const { isTablet, modalMaxWidth } = useResponsiveLayout()

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.expanded, isTablet && { maxWidth: modalMaxWidth, alignSelf: 'center' }]}>
        <View style={styles.expandedCloseRow}>
          <Pressable onPress={onClose} hitSlop={10}>
            <FontAwesomeIcon icon={faXmark} color="white" size={30} />
          </Pressable>
        </View>
        <View style={{ height: '80%', marginTop: '10%' }}>
          {kind === 'img' ? (
            <ReactNativeZoomableView
              maxZoom={10}
              minZoom={1}
              zoomStep={0.5}
              initialZoom={1}
              bindToBorders={true}
              captureEvent={true}
            >
              <Image source={{ uri: fileURL }} style={styles.fill} />
            </ReactNativeZoomableView>
          ) : (
            <PDFViewer fileURL={kind === 'word' ? convertedPDFURL : fileURL} />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '10%',
    marginBottom: '10%',
  },
  videoRow: {
    height: 200,
    width: '100%',
    backgroundColor: 'black',
  },
  fill: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  placeholderText: {
    color: '#593060',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 10,
  },
  expanded: {
    paddingTop: '10%',
    backgroundColor: '#593060',
    height: '100%',
    width: '100%',
  },
  expandedCloseRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '5%',
    paddingTop: '5%',
    width: '100%',
  },
})

export default FilePreview
