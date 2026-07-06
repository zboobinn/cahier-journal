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

export function hasContent(rows, notes) {
  if (notes && notes.trim()) return true
  return Object.values(rows).some((cell) =>
    ['n1', 'n2'].some((lvl) => {
      const c = cell?.[lvl]
      return c && (c.matiere?.trim() || c.objectif?.trim() || c.materiel?.trim())
    }),
  )
}

// Charge l'entrée de `date` (ou, à défaut, pré-remplit depuis le modèle du jour),
// puis resauvegarde automatiquement (debounce) dès qu'un vrai changement est fait.
export function useJournal(date, weekday, hours, templates) {
  const [rows, setRows] = useState(() => buildRowsForHours(hours))
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('loading') // loading | saving | saved
  const [prefilled, setPrefilled] = useState(false)

  const hoursRef = useRef(hours)
  hoursRef.current = hours
  const weekdayRef = useRef(weekday)
  weekdayRef.current = weekday
  const templatesRef = useRef(templates)
  templatesRef.current = templates
  const skipAutosaveRef = useRef(true)
  const timeoutRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    skipAutosaveRef.current = true
    setStatus('loading')
    getEntry(date).then((entry) => {
      if (cancelled) return
      if (entry) {
        setRows(buildRowsForHours(hoursRef.current, entry.rows))
        setNotes(entry.notes || '')
        setPrefilled(false)
      } else {
        const tmpl = templatesRef.current?.[weekdayRef.current]
        if (tmpl) {
          setRows(buildRowsForHours(hoursRef.current, tmpl.rows))
          setNotes(tmpl.notes || '')
          setPrefilled(true)
        } else {
          setRows(buildRowsForHours(hoursRef.current))
          setNotes('')
          setPrefilled(false)
        }
      }
      setStatus('saved')
    })
    return () => {
      cancelled = true
    }
  }, [date])

  useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false
      return
    }
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
    setPrefilled(false)
    setRows((prev) => ({
      ...prev,
      [hourId]: { ...prev[hourId], [level]: { ...prev[hourId][level], [field]: value } },
    }))
  }, [])

  const updateNotes = useCallback((value) => {
    setPrefilled(false)
    setNotes(value)
  }, [])

  const reconcileHours = useCallback((newHours) => {
    setRows((prev) => buildRowsForHours(newHours, prev))
  }, [])

  const loadTemplateData = useCallback((templateData) => {
    setRows(buildRowsForHours(hoursRef.current, templateData?.rows))
    setNotes(templateData?.notes || '')
    setPrefilled(false)
  }, [])

  return {
    rows,
    notes,
    setNotes: updateNotes,
    updateCell,
    reconcileHours,
    loadTemplateData,
    status,
    prefilled,
  }
}
