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
}) {
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

      <div className="group" style={{ marginLeft: 'auto' }}>
        <button type="button" className="btn" onClick={onOpenSettings}>Paramètres</button>
        <button type="button" className="btn primary" onClick={() => window.print()}>Imprimer</button>
      </div>
    </div>
  )
}
