const startsWithNumber = (value) => /^[0-9]/.test(value)

const compareText = (a, b) => {
  try {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  } catch {
    return a.localeCompare(b)
  }
}

/**
 * Sort items by a name field: names starting with a number come first
 * (ascending numerically), then everything else alphabetically.
 */
export function sortByName(items, key = 'fileName') {
  if (!Array.isArray(items)) return []

  return [...items].sort((a, b) => {
    const aName = typeof a?.[key] === 'string' ? a[key].trim() : ''
    const bName = typeof b?.[key] === 'string' ? b[key].trim() : ''
    const aIsNumber = startsWithNumber(aName)
    const bIsNumber = startsWithNumber(bName)

    if (aIsNumber && bIsNumber) return (parseFloat(aName) || 0) - (parseFloat(bName) || 0)
    if (aIsNumber) return -1
    if (bIsNumber) return 1
    return compareText(aName, bName)
  })
}
