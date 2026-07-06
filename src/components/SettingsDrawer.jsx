import { useEffect, useState } from 'react'
import { DAY_ORDER, DAY_LABELS } from '../data/defaults'

function serializeHours(hours) {
  return hours
    .map((h) => {
      if (h.kind === 'break') {
        const prefix = h.label === 'Récréation' ? 'R' : 'P'
        return `${prefix} ${h.start}-${h.end}`
      }
      return `${h.start}-${h.end}`
    })
    .join('\n')
}

function parseHoursText(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      let rest = line
      const rMatch = line.match(/^R\s+(.*)/i)
      const pMatch = line.match(/^P\s+(.*)/i)
      let kind = 'slot'
      let label
      if (rMatch) {
        kind = 'break'
        label = 'Récréation'
        rest = rMatch[1]
      } else if (pMatch) {
        kind = 'break'
        label = 'Pause méridienne'
        rest = pMatch[1]
      }
      const [start, end] = rest.split('-').map((s) => s.trim())
      const id = kind === 'break' ? `b${i}` : `h${i}`
      return kind === 'break' ? { id, kind, label, start, end } : { id, kind, start, end }
    })
}

export default function SettingsDrawer({
  open,
  onClose,
  dayColors,
  onDayColorChange,
  levelLabels,
  onLevelLabelChange,
  levelMode,
  onToggleLevelMode,
  hours,
  onApplyHours,
}) {
  const [hoursText, setHoursText] = useState(() => serializeHours(hours))

  useEffect(() => {
    setHoursText(serializeHours(hours))
  }, [hours])

  return (
    <>
      <div className={`backdrop${open ? ' show' : ''}`} onClick={onClose} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-label="Paramètres" aria-hidden={!open}>
        <button className="close" aria-label="Fermer" onClick={onClose}>✕</button>
        <h2>Paramètres</h2>

        <section>
          <h4>Couleurs des jours</h4>
          <div>
            {DAY_ORDER.map((day) => (
              <div className="color-row" key={day}>
                <span>{DAY_LABELS[day]}</span>
                <label title="Fond">
                  <input
                    type="color"
                    value={dayColors[day].bg}
                    onChange={(e) => onDayColorChange(day, 'bg', e.target.value)}
                  />
                </label>
                <label title="Accent / texte">
                  <input
                    type="color"
                    value={dayColors[day].accent}
                    onChange={(e) => onDayColorChange(day, 'accent', e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4>Niveaux</h4>
          <div className="lblinput">
            <label style={{ width: 66 }}>Niveau 1</label>
            <input
              type="text"
              value={levelLabels.n1}
              onChange={(e) => onLevelLabelChange('n1', e.target.value)}
            />
          </div>
          <div className="lblinput">
            <label style={{ width: 66 }}>Niveau 2</label>
            <input
              type="text"
              value={levelLabels.n2}
              onChange={(e) => onLevelLabelChange('n2', e.target.value)}
            />
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={levelMode === 'double'}
              onChange={(e) => onToggleLevelMode(e.target.checked)}
            />
            <span className="track"></span>
            <span>Double niveau</span>
          </label>
        </section>

        <section>
          <h4>Horaires</h4>
          <p className="tip">
            Une ligne = un créneau. Préfixe <b>R</b> pour une récréation, <b>P</b> pour la pause
            méridienne. Puis « Appliquer ».
          </p>
          <textarea value={hoursText} onChange={(e) => setHoursText(e.target.value)} />
          <button
            className="btn primary"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => onApplyHours(parseHoursText(hoursText))}
          >
            Appliquer les horaires
          </button>
        </section>
      </aside>
    </>
  )
}
