import HourRow from './HourRow'
import BandRow from './BandRow'
import NotesPanel from './NotesPanel'

export default function JournalSheet({
  dayLabel,
  weekday,
  fullDate,
  school,
  levelLabels,
  onLevelLabelChange,
  hours,
  rows,
  onCellChange,
  notes,
  onNotesChange,
  prefilled,
  printRectoVerso,
}) {
  return (
    <div className="sheet">
      <div className="sheet-head">
        <div className="school">
          {school.line1}
          <br />
          {school.line2}
        </div>
        <div className="titleband">
          <div className="dow">{dayLabel}</div>
          <div className="full-date">{fullDate}</div>
        </div>
        <div className="school" style={{ textAlign: 'right' }}>
          Cahier
          <br />
          journal
        </div>
      </div>

      {prefilled && (
        <p className="prefill-hint">Pré-rempli depuis le modèle du {weekday}.</p>
      )}

      {weekday === 'mercredi' ? (
        <NotesPanel
          title="Notes du mercredi"
          notes={notes}
          onNotesChange={onNotesChange}
          large
        />
      ) : (
        <>
          <div className="levels">
            <div className="spacer"></div>
            <input
              className="level-h"
              value={levelLabels.n1}
              onChange={(e) => onLevelLabelChange('n1', e.target.value)}
              aria-label="Nom du niveau 1"
            />
            <input
              className="level-h lvl2 n2head"
              value={levelLabels.n2}
              onChange={(e) => onLevelLabelChange('n2', e.target.value)}
              aria-label="Nom du niveau 2"
            />
            <div className="spacer"></div>
          </div>

          <table>
            <colgroup>
              <col className="hour" />
              <col />
              <col className="lvl2" />
              <col className="hour" />
            </colgroup>
            <tbody>
              {hours.map((h, i) => {
                const pageBreakBefore =
                  printRectoVerso &&
                  i > 0 &&
                  hours[i - 1].kind === 'break' &&
                  hours[i - 1].label === 'Pause méridienne'
                return h.kind === 'break' ? (
                  <BandRow key={h.id} hour={h} pageBreakBefore={pageBreakBefore} />
                ) : (
                  <HourRow
                    key={h.id}
                    hour={h}
                    data={rows[h.id]}
                    onCellChange={onCellChange}
                    pageBreakBefore={pageBreakBefore}
                  />
                )
              })}
            </tbody>
          </table>

          <NotesPanel title="Notes" notes={notes} onNotesChange={onNotesChange} />
        </>
      )}
    </div>
  )
}
