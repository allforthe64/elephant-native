import React, { useEffect, useRef, useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, Keyboard, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import YellowButton from '../../ui/YellowButton'
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'

/** Full-screen editor for a note; `note` comes from useNote(). */
const NoteEditor = ({ note, onSave, onClose }) => {
  const { isTablet, modalMaxWidth } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const keyboardHeight = useKeyboardHeight()
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!editing) Keyboard.dismiss()
    else inputRef.current?.focus()
  }, [editing])

  const ready = note.status === 'ready'

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => setTimeout(() => inputRef.current?.focus(), 200)}
    >
      {/* Pad by keyboard height instead of translating: the note box starts at the top, so a lift would push it off-screen */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : Math.max(insets.bottom, 16) },
          isTablet && { maxWidth: modalMaxWidth, alignSelf: 'center' },
        ]}
      >
        <View style={styles.closeRow}>
          <Pressable onPress={onClose} hitSlop={10}>
            <FontAwesomeIcon icon={faXmark} color="#593060" size={30} />
          </Pressable>
        </View>
        <Text style={[styles.heading, { marginBottom: keyboardHeight > 0 ? 12 : 24 }]}>Edit Note:</Text>
        <View style={styles.body}>
          <TextInput
            ref={inputRef}
            multiline
            value={note.text}
            editable={ready}
            style={styles.input}
            placeholder={
              note.status === 'loading' ? 'Loading note...'
              : note.status === 'error' ? "Couldn't load this note. Close and try again."
              : 'Enter note'
            }
            placeholderTextColor="#593060"
            onChangeText={note.setText}
            onFocus={() => { if (ready) setEditing(true) }}
          />
          <View style={styles.actions}>
            <YellowButton
              size="md"
              icon={faCheck}
              dimmed={!ready}
              label={editing ? 'Finished Editing' : 'Save Note'}
              onPress={() => {
                if (editing) setEditing(false)
                else onSave()
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '5%',
    paddingTop: '10%',
    width: '100%',
  },
  heading: {
    fontSize: 40,
    color: '#593060',
    fontWeight: 'bold',
    textAlign: 'left',
    width: '100%',
    paddingLeft: '5%',
  },
  body: {
    width: '100%',
    flex: 1,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  input: {
    width: '100%',
    flex: 1,
    minHeight: 160,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#593060',
    borderRadius: 12,
    color: '#593060',
    fontSize: 20,
    textAlignVertical: 'top',
    padding: '3%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
})

export default NoteEditor
