import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import React, {useState} from 'react'

//font awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight, faEllipsisVertical, faFloppyDisk, faFolder, faPencil, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

import { resolveUniqueFolderName } from '../../firebase/firestore';

import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  fileSystemRowStyles,
  FILE_SYSTEM_ROW_ACTIVE_OPACITY,
} from './fileSystemRowStyles';
import KeyboardSafeForm from '../ui/KeyboardSafeForm';
import YellowButton from '../ui/YellowButton';
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn';
import MoveFolderSheet from './MoveFolderSheet';

const Folder = ({folder, getTargetFolder, deleteFolder, renameFolder, moveFolder: moveFolderTo, folders}) => {
  const { isTablet, contentFill, modalMaxWidth } = useResponsiveLayout()
  const tabletModalPanel = isTablet
    ? { width: '100%', maxWidth: modalMaxWidth, alignSelf: 'center' }
    : null

  const [visible, setVisible] = useState(false)
  const [preDelete, setPreDelete] = useState(false)
  const [editName, setEditName] = useState(false)
  const [moveFolder, setMoveFolder] = useState(false)
  const [newName, setNewName] = useState('')
  const renameInputRef = useAutoFocusOn(editName)

  // A nested folder can always move up to a top-level folder; a top-level one needs another top-level folder.
  const canMove = folder.nestedUnder !== '' ||
    (Array.isArray(folders) && folders.some(f => f.nestedUnder === '' && f.id !== folder.id))

  //call the delete folder function from the main component and hide both modals
  const deleteFolderFunction = () => {
    deleteFolder(folder)
    setPreDelete(false)
    setVisible(false)
  }

  //pass an object containing data from the current file obj + the new filename to the main component 
  const handleNameChange = () => {
    if (newName === '') return

    // Only append " (N)" when another sibling folder already has this name
    const resolvedName = resolveUniqueFolderName(newName, folders, {
      parentId: folder.nestedUnder,
      excludeId: folder.id,
    })
    if (!resolvedName) return

    renameFolder(folder.id, resolvedName)
    setNewName('')
    setEditName(false)
  }

  const handleMove = (target) => {
    setMoveFolder(false)
    setVisible(false)
    moveFolderTo(folder.id, target)
  }

  const closeMenu = () => {
    setEditName(false)
    setVisible(false)
    setNewName('')
  }

  return (
    <View style={{position: 'relative'}}>
      {visible ?
          <Modal animationType='slide' presentationStyle='pageSheet' onRequestClose={moveFolder ? () => setMoveFolder(false) : closeMenu}>
              {preDelete ? 
                /*Code for deleting a folder */
                <Modal animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setPreDelete(false)}>
                    <View style={[{height: '100%', width: '100%', backgroundColor: '#fff'}, tabletModalPanel]}>
                    
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                        <Pressable onPress={() => setPreDelete(false)}>
                          <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                        </Pressable>
                      </View>
                    <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 22, color: '#593060', textAlign: 'center'}}>Are you sure you want to delete {folder.fileName} and all of its contents?</Text>

                      <YellowButton
                        variant="danger"
                        size="md"
                        icon={faTrash}
                        label="Delete"
                        onPress={deleteFolderFunction}
                        style={{ marginTop: '10%' }}
                      />

                      <YellowButton
                        size="md"
                        icon={faXmark}
                        label="Cancel"
                        onPress={() => setPreDelete(false)}
                        style={{ marginTop: '7%', marginBottom: '10%' }}
                      />


                    </View>
                  </View>
                </Modal>
                : moveFolder ?
                  /* No nested Modal here: it breaks flex/scroll height */
                  <MoveFolderSheet folder={folder} onMove={handleMove} onClose={() => setMoveFolder(false)} />
                :
                  <View style={[{ flex: 1, paddingTop: '10%', backgroundColor: '#fff', height: '100%'}, tabletModalPanel]}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%'}}>
                      <Pressable onPress={closeMenu}>
                        <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                      </Pressable>
                    </View>
                    {editName ? /*Code for renaming a folder */ 
                    <KeyboardSafeForm>
                    <View style={{paddingTop: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                        <Text style={{color: '#593060', fontSize: 35, fontWeight: '700'}}>Rename folder:</Text>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',  marginTop: '10%'}}>
                          <View style={styles.iconHolder}>
                              <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                          </View>
                          <TextInput value={newName} style={{color: '#593060', fontSize: 20, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} placeholderTextColor={'#593060'} placeholder='Enter new name' onChangeText={(e) => setNewName(e)} autoFocus ref={renameInputRef}/>
                        </View>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: '4%'}}>
                            <YellowButton size="sm" icon={faFloppyDisk} label="Save" onPress={handleNameChange} />
                            <YellowButton size="sm" icon={faXmark} label="Cancel" onPress={() => setEditName(false)} />
                        </View>
                    </View>
                    </KeyboardSafeForm>
                    :
                      <ScrollView
                        style={{ flex: 1, width: '100%' }}
                        contentContainerStyle={{
                          paddingLeft: '5%',
                          paddingRight: '5%',
                          paddingBottom: 48,
                          flexGrow: 1,
                        }}
                        showsVerticalScrollIndicator={false}
                      >
                        <Text style={{fontSize: 40, fontWeight: 'bold', color: '#593060', marginTop: '5%'}}>{folder.fileName}</Text>
                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%'}}>
                          <YellowButton size="sm" icon={faPencil} label="Rename" onPress={() => {
                            setNewName('')
                            setEditName(true)
                          }} />
                          {canMove &&
                              <YellowButton size="sm" icon={faArrowRight} label="Move Folder" onPress={() => setMoveFolder(true)} />
                          }
                        </View>
                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: '4%'}}>
                          <YellowButton variant="danger" size="md" icon={faTrash} label="Delete Folder" onPress={() =>
                            setPreDelete(true)} style={{ marginTop: '2%' }} />
                        </View>
                      </ScrollView>
                    }
                  </View>
                }
          </Modal>
      : <></>}
      <View style={tabletStyle(isTablet, visible ? [fileSystemRowStyles.row, fileSystemRowStyles.rowMenuOpen] : [fileSystemRowStyles.row, fileSystemRowStyles.rowFolder], contentFill)}>
        <TouchableOpacity
          onPress={() => getTargetFolder(folder)}
          activeOpacity={FILE_SYSTEM_ROW_ACTIVE_OPACITY}
          style={fileSystemRowStyles.main}
        >
            <View style={[fileSystemRowStyles.iconHolder, fileSystemRowStyles.iconHolderFolder]}>
              <FontAwesomeIcon icon={faFolder} color={'#593060'} size={20} />
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[fileSystemRowStyles.label, fileSystemRowStyles.labelFolder]}
            >
              {folder.fileName}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setVisible(prev => !prev)}
          activeOpacity={FILE_SYSTEM_ROW_ACTIVE_OPACITY}
          style={[fileSystemRowStyles.trailing, visible && fileSystemRowStyles.trailingActive]}
          accessibilityLabel="Folder options"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} size={22} color={'white'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Folder

const styles = StyleSheet.create({
    iconHolder: {
      backgroundColor: '#DDCADB',
      height: 44,
      width: 44,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100
    },
})
