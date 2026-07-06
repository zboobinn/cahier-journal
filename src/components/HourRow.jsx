import TeachingCell from './TeachingCell'

export default function HourRow({ hour, data, onCellChange }) {
  const hourLabel = (
    <div>
      {hour.start}
      <br />
      {hour.end}
    </div>
  )

  return (
    <tr>
      <td className="hour-cell">{hourLabel}</td>
      <td className="teach">
        <TeachingCell
          value={data.n1}
          onChange={(field, value) => onCellChange(hour.id, 'n1', field, value)}
        />
      </td>
      <td className="teach lvl2">
        <TeachingCell
          value={data.n2}
          onChange={(field, value) => onCellChange(hour.id, 'n2', field, value)}
        />
      </td>
      <td className="hour-cell">{hourLabel}</td>
    </tr>
  )
}
