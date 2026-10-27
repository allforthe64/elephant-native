import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowRight, faFile, faPencil } from '@fortawesome/free-solid-svg-icons'
import KeyboardSafeForm from '../../ui/KeyboardSafeForm'
import YellowButton from '../../ui/YellowButton'

const RenameFileForm = ({ value, onChangeText, inputRef, onRename, onRenameAndMove }) => (
  <KeyboardSafeForm>
    <View style={styles.container}>
      <Text style={styles.heading}>Rename File:</Text>
      <View style={styles.inputRow}>
        <View style={styles.iconHolder}>
          <FontAwesomeIcon icon={faFile} size={22} color="#9F37B0" />
        </View>
        <TextInput
          value={value}
          style={styles.input}
          placeholder="Enter new name"
          placeholderTextColor="#593060"
          onChangeText={onChangeText}
          autoFocus
          ref={inputRef}
        />
      </View>
      <View style={styles.actions}>
        <YellowButton size="md" icon={faPencil} label="Rename" onPress={onRename} />
        <YellowButton size="md" icon={faArrowRight} label="Rename + move" style={{ marginTop: 12 }} onPress={onRenameAndMove} />
      </View>
    </View>
  </KeyboardSafeForm>
)

const styles = StyleSheet.create({
  container: {
    paddingTop: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  heading: {
    color: '#593060',
    fontSize: 35,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: '10%',
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
    marginLeft: '5%',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10%',
    width: '100%',
  },
})

export default RenameFileForm
