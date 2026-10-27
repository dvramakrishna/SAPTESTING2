import type { SNote } from '../types'

const CATEGORY_LABELS: Record<string, string> = {
  'release': 'Release Note',
  'prerequisite': 'Prerequisite',
  'known-issues': 'Known Issues',
  'simplification': 'Simplification',
  'hana-os': 'HANA OS Certification',
  'hana-prereq': 'HANA Prerequisite',
  'spam-saint': 'SPAM/SAINT',
  'hana-release': 'HANA Release',
  'upgrade-central': 'Upgrade Central',
}

interface Props {
  snotes: SNote[]
  targetVersion: string
}

export default function SNotesPanel({ snotes, targetVersion }: Props) {
  if (snotes.length === 0) return null

  const mandatory = snotes.filter(n => n.mandatory)
  const optional = snotes.filter(n => !n.mandatory)

  return (
    <div className="snotes-panel">
      <h2 className="snotes-heading">
        Required SAP Notes for S/4HANA {targetVersion}
        <span className="snotes-sub">{mandatory.length} mandatory · {optional.length} recommended</span>
      </h2>

      <div className="snotes-grid">
        {[...mandatory, ...optional].map(note => (
          <div key={note.number} className={`snote-card ${note.mandatory ? 'snote-mandatory' : 'snote-optional'}`}>
            <div className="snote-header">
              <span className="snote-number">SAP Note {note.number}</span>
              <span className={`badge ${note.mandatory ? 'badge-error' : 'badge-warn'}`}>
                {note.mandatory ? 'Mandatory' : 'Recommended'}
              </span>
              <span className="badge badge-direct">{CATEGORY_LABELS[note.category] ?? note.category}</span>
            </div>
            <p className="snote-title">{note.title}</p>
            <p className="snote-desc">{note.description}</p>
            <a
              className="snote-link"
              href={`https://launchpad.support.sap.com/#/notes/${note.number}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in SAP Support Launchpad ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
