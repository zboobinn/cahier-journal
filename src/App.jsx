import { useState } from 'react'
import Toolbar from './components/Toolbar'
import JournalSheet from './components/JournalSheet'
import SettingsDrawer from './components/SettingsDrawer'
import { createDefaultSettings, DAY_LABELS } from './data/defaults'

const JS_DAY_TO_NAME = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const NAME_TO_JS_DAY = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5 }
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

function isoToDate(iso) {
  return new Date(`${iso}T00:00`)
}

function formatIso(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayIso() {
  return formatIso(new Date())
}

function getWeekday(iso) {
  return JS_DAY_TO_NAME[isoToDate(iso).getDay()]
}

function formatFullDate(iso) {
  const d = isoToDate(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getDateForWeekday(iso, targetDay) {
  const d = isoToDate(iso)
  const currentJsDay = d.getDay()
  const currentIndex = currentJsDay === 0 ? 7 : currentJsDay
  const targetIndex = NAME_TO_JS_DAY[targetDay]
  d.setDate(d.getDate() + (targetIndex - currentIndex))
  return formatIso(d)
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

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

const FALLBACK_THEME = { bg: '#F3F0E8', accent: '#8A857C', ink: '#5E564A' }

function App() {
  const [settings, setSettings] = useState(createDefaultSettings)
  const [date, setDate] = useState(todayIso)
  const [rows, setRows] = useState(() => buildRowsForHours(createDefaultSettings().hours))
  const [notes, setNotes] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const weekday = getWeekday(date)
  const theme = settings.dayColors[weekday] || FALLBACK_THEME
  const dayLabel = DAY_LABELS[weekday] || capitalize(weekday)

  function handleDayChipClick(day) {
    setDate((current) => getDateForWeekday(current, day))
  }

  function handleCellChange(hourId, level, field, value) {
    setRows((prev) => ({
      ...prev,
      [hourId]: {
        ...prev[hourId],
        [level]: { ...prev[hourId][level], [field]: value },
      },
    }))
  }

  function handleDayColorChange(day, prop, value) {
    setSettings((s) => {
      const current = { ...s.dayColors[day], [prop]: value }
      if (prop === 'accent') current.ink = value
      return { ...s, dayColors: { ...s.dayColors, [day]: current } }
    })
  }

  function handleLevelLabelChange(key, value) {
    setSettings((s) => ({ ...s, levelLabels: { ...s.levelLabels, [key]: value } }))
  }

  function handleToggleLevelMode(checked) {
    setSettings((s) => ({ ...s, levelMode: checked ? 'double' : 'single' }))
  }

  function handleApplyHours(newHours) {
    setSettings((s) => ({ ...s, hours: newHours }))
    setRows((prev) => buildRowsForHours(newHours, prev))
  }

  return (
    <div
      className={`app${settings.levelMode === 'single' ? ' single' : ''}`}
      style={{ '--day-bg': theme.bg, '--day-accent': theme.accent, '--day-ink': theme.ink }}
    >
      <Toolbar
        date={date}
        onDateChange={setDate}
        weekday={weekday}
        onDayChange={handleDayChipClick}
        dayColors={settings.dayColors}
        levelMode={settings.levelMode}
        onToggleLevelMode={handleToggleLevelMode}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <JournalSheet
        dayLabel={dayLabel}
        fullDate={formatFullDate(date)}
        school={settings.school}
        levelLabels={settings.levelLabels}
        onLevelLabelChange={handleLevelLabelChange}
        hours={settings.hours}
        rows={rows}
        onCellChange={handleCellChange}
        notes={notes}
        onNotesChange={setNotes}
      />

      <p className="hint">
        Clique dans une case pour écrire. « Paramètres » pour régler couleurs, horaires et niveaux.
      </p>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dayColors={settings.dayColors}
        onDayColorChange={handleDayColorChange}
        levelLabels={settings.levelLabels}
        onLevelLabelChange={handleLevelLabelChange}
        levelMode={settings.levelMode}
        onToggleLevelMode={handleToggleLevelMode}
        hours={settings.hours}
        onApplyHours={handleApplyHours}
      />
    </div>
  )
}

export default App
