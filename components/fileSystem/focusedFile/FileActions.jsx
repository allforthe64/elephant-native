import React from 'react'
import { View, Linking, StyleSheet } from 'react-native'
import { faArrowUpRightFromSquare, faFolder, faFont, faPause, faPencil, faPlay, faShare, faTrash } from '@fortawesome/free-solid-svg-icons'
import * as FileSystem from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import YellowButton from '../../ui/YellowButton'
import { useAudioPlayback } from '../../../hooks/useAudioPlayback'

const AUDIO_TYPES = ['m4a', 'mp3']

const shareFile = async (url, fileName) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, FileSystem.cacheDirectory + fileName)
    await shareAsync(uri)
  } catch (err) {
    alert(err?.message || String(err))
  }
}

const AudioButton = ({ fileURL }) => {
  const { playing, play, pause } = useAudioPlayback(fileURL)
  return (
    <YellowButton
      size="lg"
      icon={fileURL ? (playing ? faPause : faPlay) : undefined}
      label={!fileURL ? 'Fetching File...' : playing ? 'Pause Sound' : 'Play Sound'}
      disabled={!fileURL}
      style={styles.spaced}
      onPress={playing ? pause : play}
    />
  )
}

/** Rename/move row plus the per-type action buttons under a file preview. */
const FileActions = ({ file, fileObj, fileURL, kind, isNote, onRename, onMove, onEditNote, onDelete }) => {
  // Images and Word documents are viewed through their in-app preview instead.
  const showOpenButtons = kind !== 'image' && kind !== 'word'

  return (
    <>
      <View style={styles.renameMoveRow}>
        <YellowButton size="sm" icon={faFont} label="Rename file" onPress={onRename} />
        <YellowButton size="sm" icon={faFolder} label="Move file..." onPress={onMove} />
      </View>
      <View style={styles.column}>
        {showOpenButtons ? (
          <>
            {AUDIO_TYPES.includes(fileObj.documentType) ? (
              <AudioButton fileURL={fileURL} />
            ) : isNote ? (
              <YellowButton
                size="lg"
                icon={faPencil}
                label="View/Edit Note"
                disabled={!fileURL}
                style={styles.spaced}
                onPress={onEditNote}
              />
            ) : null}
            <YellowButton
              size="lg"
              icon={fileURL ? faArrowUpRightFromSquare : undefined}
              label={fileURL ? 'View File In Browser' : 'Fetching File...'}
              disabled={!fileURL}
              style={styles.spaced}
              onPress={() => Linking.openURL(fileURL)}
            />
          </>
        ) : null}
        {fileObj.linksTo ? (
          <YellowButton
            size="lg"
            icon={fileURL ? faArrowUpRightFromSquare : undefined}
            label="Go To URL"
            disabled={!fileURL}
            style={styles.spaced}
            onPress={() => Linking.openURL(fileObj.linksTo)}
          />
        ) : null}
        <YellowButton
          size="lg"
          icon={faShare}
          label="Download or share file"
          disabled={!fileURL}
          style={styles.spaced}
          onPress={() => shareFile(fileURL, file.fileName)}
        />
        <YellowButton
          size="lg"
          variant="danger"
          icon={faTrash}
          label="Delete File"
          style={styles.spaced}
          onPress={onDelete}
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  renameMoveRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: '5%',
  },
  column: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '10%',
  },
  spaced: {
    marginTop: '2%',
  },
})

export default FileActions
