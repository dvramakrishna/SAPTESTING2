import type { HanaGap, OsGap } from '../types'

interface Props {
  hanaGap: HanaGap
  osGap: OsGap
}

export default function GapAnalysisTable({ hanaGap, osGap }: Props) {
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
          <td><strong>OS</strong></td>
          <td>{osGap.current_version_label}</td>
          <td>{osGap.supported_versions_label.join(', ')}</td>
          <td>
            <span className={`badge ${osGap.upgrade_needed ? 'badge-error' : 'badge-ok'}`}>
              {osGap.upgrade_needed ? 'NOT SUPPORTED' : 'OK'}
            </span>
          </td>
          <td>{osGap.message}</td>
        </tr>
      </tbody>
    </table>
  )
}
