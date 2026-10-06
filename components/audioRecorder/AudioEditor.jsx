import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlay, faTrash, faPencil, faCheck } from '@fortawesome/free-solid-svg-icons'
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import YellowButton from '../ui/YellowButton'
import { Brand } from '../../constants/layout'

const AudioEditor = ({recordingLine, index, deleteFunc, editRecordings, recordings, onPlay}) => {
    const { isTablet, contentFill } = useResponsiveLayout()
    const [renaming, setRenaming] = useState(false)
    const [draftName, setDraftName] = useState('')
    const inputRef = useAutoFocusOn(renaming)

    const commitName = () => {
        const name = draftName.trim()
        if (name) {
            editRecordings(prev => prev.map((rec, i) => i === index ? { ...rec, name } : rec))
        }
    }

    const toggleRename = () => {
        if (renaming) {
            commitName()
            setRenaming(false)
        } else {
            setDraftName('')
            setRenaming(true)
        }
    }

  return (
    <View style={tabletStyle(isTablet, styles.card, contentFill)}>
        <View style={styles.topRow}>
            <TouchableOpacity
                onPress={() => onPlay?.(recordingLine.file)}
                accessibilityLabel={`Play ${recordingLine.name}`}
                style={styles.playButton}
            >
                <FontAwesomeIcon icon={faPlay} color='#fff' size={16}/>
            </TouchableOpacity>
            <Text style={styles.name} numberOfLines={1}>{recordingLine.name}</Text>
            <Text style={styles.duration}>{recordingLine.duration}</Text>
            <TouchableOpacity
                onPress={() => deleteFunc(recordings, recordingLine)}
                accessibilityLabel={`Delete ${recordingLine.name}`}
            >
                <View style={styles.iconHolderSM}>
                    <FontAwesomeIcon icon={faTrash} size={18} color={Brand.danger}/>
                </View>
            </TouchableOpacity>
        </View>

        {renaming &&
            <View style={styles.renameBlock}>
                <Text style={styles.inputLabel}>New recording name</Text>
                <View style={styles.inputWrap}>
                    <FontAwesomeIcon icon={faPencil} size={16} color={Brand.purple}/>
                    <TextInput
                        ref={inputRef}
                        autoFocus
                        style={styles.input}
                        value={draftName}
                        onChangeText={setDraftName}
                        placeholder={recordingLine.name}
                        placeholderTextColor='#9C8AA0'
                        returnKeyType='done'
                        onSubmitEditing={toggleRename}
                        accessibilityLabel='New recording name'
                    />
                </View>
            </View>
        }

        <YellowButton
            size="xs"
            icon={renaming ? faCheck : faPencil}
            label={renaming ? 'Done' : 'Rename recording'}
            onPress={toggleRename}
            accessibilityLabel={renaming ? 'Done renaming recording' : 'Rename recording'}
            style={styles.renameButton}
        />
    </View>
  )
}

export default AudioEditor

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: Brand.lavender,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Brand.purple,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
    },
    name: {
        flex: 1,
        color: Brand.purple,
        fontSize: 16,
        fontWeight: '700',
    },
    duration: {
        color: Brand.purple,
        fontSize: 14,
        fontWeight: '500',
    },
    renameBlock: {
        marginTop: 10,
    },
    inputLabel: {
        color: Brand.purple,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: Brand.purple,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        color: Brand.purple,
        fontSize: 16,
        paddingVertical: 10,
    },
    renameButton: {
        marginTop: 10,
    },
    iconHolderSM: {
        backgroundColor: 'white',
        height: 36,
        width: 36,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
})
