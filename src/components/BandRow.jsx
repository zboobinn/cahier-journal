export default function BandRow({ hour }) {
  return (
    <tr className="band">
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
