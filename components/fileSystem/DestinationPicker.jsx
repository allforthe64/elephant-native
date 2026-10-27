import React from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark, faFile, faFolder, faArrowLeft, faFloppyDisk, faStopwatch } from '@fortawesome/free-solid-svg-icons'
import ContentShell from '../ui/ContentShell'
import KeyboardSafeForm from '../ui/KeyboardSafeForm'
import YellowButton from '../ui/YellowButton'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import DestinationFolderScroller from './DestinationFolderScroller'
import MoveFolderDestinationRow from './MoveFolderDestinationRow'

/**
 * Folder picker body driven by useSaveDestination(): close button, optional
 * naming step, add-folder form, and the folder list with a caller-supplied footer.
 * Render inside an existing sheet; nested pageSheet Modals break flex height.
 */
const DestinationPicker = ({ save, title, footer, nameHeading, nameRef, onClose = save.close }) => {
  const { select } = useResponsiveLayout()
  const headingTablet = select(undefined, styles.headingTablet)

  const renderNameStep = () => (
    <KeyboardSafeForm>
      <>
        <Text style={[styles.heading, { marginTop: '35%' }, headingTablet]}>{nameHeading}</Text>
        <View style={styles.inputRow}>
          <View style={styles.iconHolder}>
            <FontAwesomeIcon icon={faFile} size={22} color="#9F37B0" />
          </View>
          <TextInput
            ref={nameRef}
            value={save.name}
            onChangeText={save.setName}
            placeholder="Enter name"
            placeholderTextColor="#593060"
            style={styles.input}
          />
        </View>
        <View style={styles.nameActions}>
          <YellowButton
            size="md"
            icon={faFloppyDisk}
            label="Save"
            dimmed={save.name.trim() === ''}
            onPress={() => save.setNameGiven(true)}
          />
          <Text style={styles.orText}>Or</Text>
          <YellowButton
            size="md"
            icon={faStopwatch}
            label="Use Timestamp"
            style={{ marginTop: '2%' }}
            onPress={() => {
              save.setName('')
              save.setNameGiven(true)
            }}
          />
        </View>
      </>
    </KeyboardSafeForm>
  )

  const renderAddFolderForm = () => (
    <KeyboardSafeForm>
      <>
        <Text style={[styles.heading, { marginTop: '40%' }, headingTablet]}>Add A New Folder:</Text>
        <View style={styles.inputRow}>
          <View style={styles.iconHolder}>
            <FontAwesomeIcon icon={faFolder} size={22} color="#9F37B0" />
          </View>
          <TextInput
            ref={save.addFolderInputRef}
            value={save.newFolderName}
            onChangeText={save.setNewFolderName}
            placeholder="Enter new name"
            placeholderTextColor="#593060"
            style={styles.input}
            autoFocus
            showSoftInputOnFocus
            onLayout={() => save.addFolderInputRef.current?.focus?.()}
            onSubmitEditing={save.addFolder}
            returnKeyType="done"
          />
        </View>
        <View style={styles.addFolderActions}>
          <YellowButton size="md" icon={faFloppyDisk} label="Save" onPress={save.addFolder} />
        </View>
      </>
    </KeyboardSafeForm>
  )

  const renderFolderPicker = () => {
    const showEmpty = !!save.focusedFolder && !save.hasSubFolders
    return (
      <View style={styles.picker}>
        <Text style={styles.title}>{title}</Text>
        {save.focusedFolderInst ? (
          <Text style={styles.viewing}>Viewing: {save.focusedFolderInst.fileName}</Text>
        ) : null}
        {save.focusedFolder ? (
          <YellowButton size="xs" icon={faArrowLeft} label="Back" style={styles.backButton} onPress={save.goBack} />
        ) : null}
        <DestinationFolderScroller centerEmpty={showEmpty}>
          {showEmpty ? (
            <Text style={[styles.emptyText, select(undefined, styles.emptyTextTablet)]}>No Subfolders...</Text>
          ) : (
            save.visibleFolders.map((folder) => (
              <MoveFolderDestinationRow
                key={folder.id}
                selected={folder.id === save.destination.id}
                fileName={folder.fileName}
                onPress={() => save.selectFolder(folder)}
              />
            ))
          )}
        </DestinationFolderScroller>
        {footer}
      </View>
    )
  }

  const showNameStep = !!nameHeading && !save.nameGiven

  return (
    <View style={styles.sheet}>
      <View style={styles.closeRow}>
        <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={10}>
          <FontAwesomeIcon icon={faXmark} color="#593060" size={30} />
        </Pressable>
      </View>
      <ContentShell variant="modal" fill>
        {showNameStep
          ? renderNameStep()
          : save.addFolderForm
            ? renderAddFolderForm()
            : renderFolderPicker()}
      </ContentShell>
    </View>
  )
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '5%',
    paddingTop: '10%',
    width: '100%',
  },
  heading: {
    color: '#593060',
    fontSize: 35,
    fontWeight: '700',
    textAlign: 'center',
  },
  headingTablet: {
    marginTop: 48,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: '10%',
    width: '100%',
  },
  iconHolder: {
    backgroundColor: 'white',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  input: {
    color: '#593060',
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomColor: '#593060',
    borderBottomWidth: 2,
    width: '70%',
  },
  nameActions: {
    width: '100%',
    alignItems: 'center',
    paddingTop: '5%',
  },
  orText: {
    color: '#593060',
    fontSize: 20,
    marginTop: '2%',
    textAlign: 'center',
  },
  addFolderActions: {
    width: '100%',
    paddingTop: '10%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 40,
    color: '#593060',
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    paddingLeft: '5%',
    marginBottom: 8,
  },
  viewing: {
    fontSize: 20,
    color: '#593060',
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    paddingLeft: '5%',
    marginBottom: 8,
  },
  backButton: {
    marginBottom: 8,
    marginLeft: '5%',
  },
  emptyText: {
    fontSize: 30,
    color: '#593060',
    fontWeight: 'bold',
    marginTop: '30%',
    textAlign: 'center',
  },
  emptyTextTablet: {
    marginTop: 48,
  },
})

export default DestinationPicker
