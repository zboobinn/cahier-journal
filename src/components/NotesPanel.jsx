export default function NotesPanel({ title, notes, onNotesChange }) {
  return (
    <div className="notes">
      <h3>{title}</h3>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Choses à faire, rappels…"
      />
    </div>
  )
}
