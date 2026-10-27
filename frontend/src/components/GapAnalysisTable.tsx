import type { HanaGap, OsGap, HanaOsGap } from '../types'

interface Props {
  hanaGap: HanaGap
  osGap: OsGap
  hanaOsGap: HanaOsGap
}

export default function GapAnalysisTable({ hanaGap, osGap, hanaOsGap }: Props) {
  return (
    <table className="gap-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Current</th>
          <th>Required / Supported</th>
          <th>Status</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>HANA DB</strong></td>
          <td>{hanaGap.current_version_label}</td>
          <td>{hanaGap.required_version_label} (min)</td>
          <td>
            <span className={`badge ${hanaGap.upgrade_needed ? 'badge-warn' : 'badge-ok'}`}>
              {hanaGap.upgrade_needed ? 'UPGRADE NEEDED' : 'OK'}
            </span>
          </td>
          <td>{hanaGap.message}</td>
        </tr>
        <tr>
          <td><strong>OS for S/4HANA</strong></td>
          <td>{osGap.current_version_label}</td>
          <td>{osGap.supported_versions_label.join(', ')}</td>
          <td>
            <span className={`badge ${osGap.upgrade_needed ? 'badge-error' : 'badge-ok'}`}>
              {osGap.upgrade_needed ? 'NOT SUPPORTED' : 'OK'}
            </span>
          </td>
          <td>{osGap.message}</td>
        </tr>
        <tr>
          <td>
            <strong>OS for HANA</strong>
            <br />
            <small className="note-ref">SAP Note {hanaOsGap.note_reference}</small>
          </td>
          <td>{hanaOsGap.os_current_label}</td>
          <td>{hanaOsGap.supported_os_for_hana.join(', ')}</td>
          <td>
            <span className={`badge ${hanaOsGap.is_compatible ? 'badge-ok' : 'badge-error'}`}>
              {hanaOsGap.is_compatible ? 'CERTIFIED' : 'NOT CERTIFIED'}
            </span>
          </td>
          <td>{hanaOsGap.message}</td>
        </tr>
      </tbody>
    </table>
  )
}

