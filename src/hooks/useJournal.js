import { useCallback, useEffect, useRef, useState } from 'react'
import { getEntry, saveEntry } from '../storage/local'

const AUTOSAVE_DELAY = 600

function emptyCell() {
  return { matiere: '', objectif: '', materiel: '' }
}

function buildRowsForHours(hours, previous = {}) {
  const rows = {}
  hours
    .filter((h) => h.kind === 'slot')
    .forEach((h) => {
      rows[h.id] = previous[h.id] || { n1: emptyCell(), n2: emptyCell() }
    })
  return rows
}

// Charge l'entrée de `date`, la resauvegarde automatiquement (debounce) à chaque
// modification des cases ou des notes.
export function useJournal(date, weekday, hours) {
  const [rows, setRows] = useState(() => buildRowsForHours(hours))
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('loading') // loading | saving | saved

  const hoursRef = useRef(hours)
  hoursRef.current = hours
  const skipAutosaveRef = useRef(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    skipAutosaveRef.current = true
    setStatus('loading')
    getEntry(date).then((entry) => {
      if (cancelled) return
      setRows(buildRowsForHours(hoursRef.current, entry?.rows))
      setNotes(entry?.notes || '')
      setStatus('saved')
      skipAutosaveRef.current = false
    })
    return () => {
      cancelled = true
    }
  }, [date])

  useEffect(() => {
    if (skipAutosaveRef.current) return
    setStatus('saving')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveEntry(date, { weekday, rows, notes, updatedAt: new Date().toISOString() }).then(() =>
        setStatus('saved'),
      )
    }, AUTOSAVE_DELAY)
    return () => clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, notes])

  const updateCell = useCallback((hourId, level, field, value) => {
    setRows((prev) => ({
      ...prev,
      [hourId]: { ...prev[hourId], [level]: { ...prev[hourId][level], [field]: value } },
    }))
  }, [])

  const reconcileHours = useCallback((newHours) => {
    setRows((prev) => buildRowsForHours(newHours, prev))
  }, [])

  return { rows, notes, setNotes, updateCell, reconcileHours, status }
}
