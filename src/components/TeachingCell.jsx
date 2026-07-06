export default function TeachingCell({ value, onChange }) {
  return (
    <div className="cell">
      <input
        className="matiere"
        type="text"
        value={value.matiere}
        onChange={(e) => onChange('matiere', e.target.value)}
        placeholder="Matière"
        aria-label="Matière"
      />
      <div className="field">
        <span className="lbl">Objectif</span>
        <input
          className="val"
          type="text"
          value={value.objectif}
          onChange={(e) => onChange('objectif', e.target.value)}
          aria-label="Objectif"
        />
      </div>
      <div className="field">
        <span className="lbl">Matériel</span>
        <input
          className="val"
          type="text"
          value={value.materiel}
          onChange={(e) => onChange('materiel', e.target.value)}
          aria-label="Matériel"
        />
      </div>
    </div>
  )
}
