import React from 'react'
import { Pressable, View, Text } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import {
  fileSystemRowStyles,
  FILE_SYSTEM_ROW_ACTIVE_OPACITY,
} from './fileSystemRowStyles'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

/**
 * Squared folder row for Move To / Save To destination pickers.
 * Matches the file-system Folder row language (radius 14, square icon holder).
 */
const MoveFolderDestinationRow = ({ selected, fileName, onPress }) => {
  const { isTablet, contentFill } = useResponsiveLayout()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width: '100%', alignItems: 'center', opacity: pressed ? FILE_SYSTEM_ROW_ACTIVE_OPACITY : 1 },
      ]}
    >
      <View
        style={tabletStyle(
          isTablet,
          [
            fileSystemRowStyles.row,
            selected
              ? fileSystemRowStyles.rowMoveDestinationSelected
              : fileSystemRowStyles.rowMoveDestination,
          ],
          contentFill
        )}
      >
        <View style={fileSystemRowStyles.main}>
          <View
            style={[
              fileSystemRowStyles.iconHolder,
              selected
                ? fileSystemRowStyles.iconHolderMoveSelected
                : fileSystemRowStyles.iconHolderFolder,
            ]}
          >
            <FontAwesomeIcon
              icon={faFolder}
              size={20}
              color={selected ? '#fff' : '#593060'}
            />
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              fileSystemRowStyles.label,
              selected
                ? fileSystemRowStyles.labelMoveDestinationSelected
                : fileSystemRowStyles.labelMoveDestination,
            ]}
          >
            {fileName}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default MoveFolderDestinationRow
