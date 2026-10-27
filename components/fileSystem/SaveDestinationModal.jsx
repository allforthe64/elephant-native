import React, { useRef } from 'react'
import { Modal } from 'react-native'
import DestinationPicker from './DestinationPicker'
import SaveDestinationActions from './SaveDestinationActions'

/**
 * "Save To..." sheet driven by useSaveDestination().
 * Pass `nameHeading` to show a naming step (custom name or timestamp) first.
 */
const SaveDestinationModal = ({ save, title, nameHeading, onSaveStaging, onConfirm }) => {
  const nameRef = useRef(null)

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={save.close}
      onShow={nameHeading ? () => setTimeout(() => nameRef.current?.focus?.(), 200) : undefined}
    >
      <DestinationPicker
        save={save}
        title={title}
        nameHeading={nameHeading}
        nameRef={nameRef}
        footer={
          <SaveDestinationActions
            onAddFolder={() => save.setAddFolderForm(true)}
            onSaveStaging={onSaveStaging}
            onConfirmMove={onConfirm}
            confirmDisabled={!save.canConfirm}
          />
        }
      />
    </Modal>
  )
}

export default SaveDestinationModal
