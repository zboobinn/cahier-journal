export default function BandRow({ hour, pageBreakBefore }) {
  return (
    <tr className={`band${pageBreakBefore ? ' page-break' : ''}`}>
      <td className="hour-cell">
        {hour.start}
        <br />
        {hour.end}
      </td>
      <td colSpan={2}>{hour.label}</td>
      <td className="hour-cell">
        {hour.start}
        <br />
        {hour.end}
      </td>
    </tr>
  )
}
