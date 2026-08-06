import { StyleSheet } from 'react-native'
import { Brand } from '../../constants/layout'

/**
 * Shared visual language for folder (home) and file (staging) list rows.
 * Keep journeys the same — only polish contrast, truncation, and press feedback.
 */
export const fileSystemRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 10,
    marginBottom: 8,
    borderRadius: 100,
    overflow: 'hidden',
  },
  rowFolder: {
    backgroundColor: Brand.purple,
  },
  rowFile: {
    backgroundColor: Brand.lavender,
  },
  rowMenuOpen: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    borderRadius: 0,
    marginBottom: 16,
    paddingLeft: 12,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingRight: 8,
  },
  iconHolder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconHolderFolder: {
    backgroundColor: Brand.lavender,
  },
  iconHolderFile: {
    backgroundColor: '#fff',
  },
  label: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  labelFolder: {
    color: '#fff',
  },
  labelFile: {
    color: Brand.purple,
  },
  trailing: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 22,
  },
  trailingActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    flexShrink: 0,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
})

export const FILE_SYSTEM_ROW_ACTIVE_OPACITY = 0.72
