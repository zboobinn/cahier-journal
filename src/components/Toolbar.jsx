import { useRef } from 'react'
import { DAY_ORDER } from '../data/defaults'

const DAY_SHORT = { lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu', vendredi: 'Ven' }

export default function Toolbar({
  date,
  onDateChange,
  weekday,
  onDayChange,
  dayColors,
  levelMode,
  onToggleLevelMode,
  onOpenSettings,
  onExport,
  onImportFile,
  statusLabel,
  onSaveTemplate,
  onLoadTemplate,
  syncStatusLabel,
  syncErrorMessage,
}) {
  const fileInputRef = useRef(null)

  return (
    <div className="toolbar">
      <div className="group">
        <label className="cap" htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="group">
        <label className="cap">Jour</label>
        <div className="days" role="group" aria-label="Jour de la semaine">
          {DAY_ORDER.map((day) => {
            const c = dayColors[day]
            return (
              <button
                key={day}
                type="button"
                className="day-chip"
                aria-pressed={weekday === day}
                style={{ '--chip-bg': c.bg, '--chip-ink': c.accent }}
                onClick={() => onDayChange(day)}
              >
                {DAY_SHORT[day]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="group">
        <label className="switch">
          <input
            type="checkbox"
            checked={levelMode === 'double'}
            onChange={(e) => onToggleLevelMode(e.target.checked)}
          />
          <span className="track"></span>
          <span>Double niveau</span>
        </label>
      </div>

      {statusLabel && (
        <span className="cap" aria-live="polite">{statusLabel}</span>
      )}

      {syncStatusLabel && (
        <span
          className="cap"
          aria-live="polite"
          title={syncStatusLabel === 'Erreur' ? syncErrorMessage : undefined}
        >
          {syncStatusLabel}
        </span>
      )}

      <div className="group" style={{ marginLeft: 'auto' }}>
        <button type="button" className="btn" onClick={onSaveTemplate}>
          Enregistrer comme modèle du {weekday}
        </button>
        <button type="button" className="btn" onClick={onLoadTemplate}>
          Charger le modèle du {weekday}
        </button>
        <button type="button" className="btn" onClick={onOpenSettings}>Paramètres</button>
        <button type="button" className="btn" onClick={onExport}>Exporter</button>
        <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
          Importer
        </button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onImportFile(file)
            e.target.value = ''
          }}
        />
        <button type="button" className="btn primary" onClick={() => window.print()}>Imprimer</button>
      </div>
    </div>
  )
}
