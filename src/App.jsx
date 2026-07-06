import { useEffect, useRef, useState } from 'react'
import Toolbar from './components/Toolbar'
import JournalSheet from './components/JournalSheet'
import SettingsDrawer from './components/SettingsDrawer'
import { createDefaultSettings, DAY_LABELS } from './data/defaults'
import { getSettings, saveSettings, getTemplates, saveTemplates, exportAll, importAll } from './storage/local'
import { useJournal, hasContent } from './hooks/useJournal'

const JS_DAY_TO_NAME = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const NAME_TO_JS_DAY = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5 }
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const SETTINGS_SAVE_DELAY = 600

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

const FALLBACK_THEME = { bg: '#F3F0E8', accent: '#8A857C', ink: '#5E564A' }

const STATUS_LABEL = {
  loading: 'Chargement…',
  saving: 'Enregistrement…',
  saved: 'Enregistré',
}

function App() {
  const [settings, setSettings] = useState(createDefaultSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [templates, setTemplates] = useState({})
  const [date, setDate] = useState(todayIso)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const skipSettingsSaveRef = useRef(true)

  const weekday = getWeekday(date)
  const theme = settings.dayColors[weekday] || FALLBACK_THEME
  const dayLabel = DAY_LABELS[weekday] || capitalize(weekday)

  const {
    rows,
    notes,
    setNotes,
    updateCell,
    reconcileHours,
    loadTemplateData,
    status,
    prefilled,
  } = useJournal(date, weekday, settings.hours, templates)

  // Chargement initial des réglages depuis IndexedDB.
  useEffect(() => {
    let cancelled = false
    getSettings().then((s) => {
      if (cancelled) return
      skipSettingsSaveRef.current = true
      setSettings(s)
      setSettingsLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Sauvegarde (debounce) des réglages à chaque modification.
  useEffect(() => {
    if (!settingsLoaded) return
    if (skipSettingsSaveRef.current) {
      skipSettingsSaveRef.current = false
      return
    }
    const t = setTimeout(() => saveSettings(settings), SETTINGS_SAVE_DELAY)
    return () => clearTimeout(t)
  }, [settings, settingsLoaded])

  // Chargement initial des modèles par jour depuis IndexedDB.
  useEffect(() => {
    let cancelled = false
    getTemplates().then((t) => {
      if (cancelled) return
      setTemplates(t)
    })
    return () => {
      cancelled = true
    }
  }, [])

  function handleDayChipClick(day) {
    setDate((current) => getDateForWeekday(current, day))
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
    reconcileHours(newHours)
  }

  async function handleExport() {
    const data = await exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cahier-journal-${todayIso()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSaveTemplate() {
    const updated = { ...templates, [weekday]: { rows, notes } }
    setTemplates(updated)
    saveTemplates(updated)
  }

  function handleLoadTemplate() {
    const tmpl = templates[weekday]
    if (!tmpl) {
      window.alert(`Aucun modèle enregistré pour ${dayLabel}.`)
      return
    }
    if (hasContent(rows, notes)) {
      const ok = window.confirm(
        `Écraser le contenu actuel du ${dayLabel} avec le modèle enregistré ?`,
      )
      if (!ok) return
    }
    loadTemplateData(tmpl)
  }

  function handleImportFile(file) {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        await importAll(data)
        window.location.reload()
      } catch {
        window.alert("Le fichier importé n'est pas valide.")
      }
    }
    reader.readAsText(file)
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
        onExport={handleExport}
        onImportFile={handleImportFile}
        statusLabel={STATUS_LABEL[status]}
        onSaveTemplate={handleSaveTemplate}
        onLoadTemplate={handleLoadTemplate}
      />

      <JournalSheet
        dayLabel={dayLabel}
        weekday={weekday}
        fullDate={formatFullDate(date)}
        school={settings.school}
        levelLabels={settings.levelLabels}
        onLevelLabelChange={handleLevelLabelChange}
        hours={settings.hours}
        rows={rows}
        onCellChange={updateCell}
        notes={notes}
        onNotesChange={setNotes}
        prefilled={prefilled}
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
