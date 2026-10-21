import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, Keyboard, Platform, KeyboardAvoidingView, Alert } from 'react-native'

//fontAwesome imports
import { faCheck, faPencil, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import safe area context
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import YellowButton from '../../components/ui/YellowButton'
import AppTextInput from '../../components/ui/AppTextInput'
import ContentShell from '../../components/ui/ContentShell'
import StickyFooter from '../../components/ui/StickyFooter'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { enqueueUploads, randomQueueId } from '../../utils/uploadQueue'

const Notepad = () => {
    const { isTablet } = useResponsiveLayout()
    const keyboardHeight = useKeyboardHeight()
    const insets = useSafeAreaInsets()
    const save = useSaveDestination()

    const [open, setOpen] = useState(true)
    const [body, setBody] = useState('')

    const ref = useRef(null)

    const alertSaveError = (err) => {
      const message =
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        err?.toString?.() ||
        'Something went wrong'
      Alert.alert('Save failed', message)
    }

    const withSaveErrorAlert = async (fn) => {
      try {
        await fn()
      } catch (err) {
        alertSaveError(err)
      }
    }

    const saveNote = () => {
      return withSaveErrorAlert(() => {
        setOpen(false)
      })
    }

    const startEdit = () => {
      setOpen(true)
    }

    const addToStorage = (toStaging = false) => {
      return withSaveErrorAlert(async () => {
        //generate formatted date and fileName
        const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")
        const noteName = save.name.trim()
        const filename = noteName !== '' ? `${noteName}.txt` : `Note from: ${formattedDate}.txt`

        await enqueueUploads([{
          uri: `${randomQueueId()} - note.txt`,
          filename,
          fileType: 'txt',
          finalDestination: save.resolveDestination(toStaging),
          noteBody: body,
        }])

        setBody('')
        save.reset()
      })
    }

    useEffect(() => {
      if (open === false) Keyboard.dismiss() 
      else ref.current.focus() 
    },[open])

  return (
    <>
      {save.preAdd ? 
        <SaveDestinationModal
          save={save}
          title="Save Note To..."
          nameHeading="Name Note:"
          onSaveStaging={() => addToStorage(true)}
          onConfirm={() => addToStorage()}
        />
      : <>
        <ContentShell variant="content" fill>
        <KeyboardAvoidingView
          style={[
            styles.editorRoot,
            // Android often overlays the keyboard instead of resizing this screen —
            // pad the editor so Save note stays above it.
            Platform.OS === 'android' && keyboardHeight > 0
              ? { paddingBottom: keyboardHeight }
              : null,
          ]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 48 : 0}
        >
            <AppTextInput
                        testID={TestIds.notes.body}
                        accessibilityLabel="Note body"
                        onChangeText={(e) => setBody(e)}
                        value={body}
                        placeholder={'Add a note...'}
                        style={{
                            flex: 1,
                            backgroundColor: 'white',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: Math.max(insets.top, 12),
                            paddingBottom: 16,
                            fontSize: 18,
                            textAlignVertical: 'top',
                            width: '100%',
                            color: 'black'
                        }}
                        editable={!!open}
                        multiline
                        numberOfLines={2}
                        placeholderTextColor='grey'
                        ref={ref}
                        autoFocus
                        />
          <StickyFooter style={styles.toolbar}>
            {!open && 
                <YellowButton
                  testID={TestIds.notes.addToStorage}
                  accessibilityLabel="Add To Storage"
                  size="sm"
                  icon={faCloudArrowUp}
                  label="Add To Storage"
                  onPress={save.open}
                  style={isTablet ? tabletStyles.actionButton : undefined}
                />
              }
                  <YellowButton
                    testID={TestIds.notes.saveEdit}
                    accessibilityLabel={open ? 'Save note' : 'Edit note'}
                    size="xs"
                    icon={open ? faCheck : faPencil}
                    label={open ? 'Save note' : 'Edit note'}
                    onPress={() => {open === false ? startEdit() : saveNote()}}
                    style={{ alignSelf: 'center' }}
                  />
          </StickyFooter>
        </KeyboardAvoidingView>
        </ContentShell>
        </>
      } 
    </>
  )
}

const styles = StyleSheet.create({
    editorRoot: {
      flex: 1,
      width: '100%',
      backgroundColor: 'white',
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
    },
})

const tabletStyles = StyleSheet.create({
  actionButton: {
    maxWidth: '100%',
  },
})

export default Notepad
