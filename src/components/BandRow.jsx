export default function BandRow({ hour, double, pageBreakBefore }) {
  return (
    <tr className={`band${pageBreakBefore ? ' page-break' : ''}`}>
      <td className="hour-cell">
        {hour.start}
        <br />
        {hour.end}
      </td>
      <td colSpan={double ? 2 : 1}>{hour.label}</td>
      <td className="hour-cell">
        {hour.start}
        <br />
        {hour.end}
      </td>
    </tr>
  )
}
