interface CheckItem {
  id: string
  label: string
  detail: string
}

interface CheckSection {
  id: string
  title: string
  icon: string
  color: string
  items: CheckItem[]
}

const CHECKLIST: CheckSection[] = [
  {
    id: 'simplification',
    title: 'Simplification Item Checks',
    icon: '🔍',
    color: 'check-simplification',
    items: [
      {
        id: 'simp-1',
        label: 'Run Simplification Item Check (transaction /SDF/RC_START_CHECK)',
        detail:
          'Execute the Readiness Check in the source system. All simplification items must show GREEN status for every client in the system before the upgrade can proceed.',
      },
      {
        id: 'simp-2',
        label: 'Resolve all RED/YELLOW simplification items across all clients',
        detail:
          'Log on to each client (including 000, 001, and all production clients) and resolve flagged items. Do not start the upgrade until all clients are GREEN — a single unresolved client blocks SUM.',
      },
      {
        id: 'simp-3',
        label: 'Document resolved items and obtain sign-off from application owner',
        detail:
          'Keep a record of every item resolved and the responsible team. This is required for change management and audit trail.',
      },
    ],
  },
  {
    id: 'space',
    title: 'File System Space Check',
    icon: '💾',
    color: 'check-space',
    items: [
      {
        id: 'space-1',
        label: 'Verify at least 15% free space on all critical file systems',
        detail:
          'Check /usr/sap, /sapmnt, /hana/data, /hana/log, /hana/shared, and /tmp. Run: df -h. SUM requires working space; HANA data/log volumes need headroom for delta merge and log backup during upgrade.',
      },
      {
        id: 'space-2',
        label: 'Ensure HANA backup volume has sufficient space for a full data backup',
        detail:
          'A full HANA data backup must be taken before the upgrade starts. Verify the backup destination has capacity for at least 1.2× the current data volume size.',
      },
      {
        id: 'space-3',
        label: 'Check OS swap and /tmp space (minimum 50 GB free on /tmp)',
        detail:
          'SUM extracts large archives to /tmp during processing. Insufficient /tmp space is a common cause of mid-upgrade failures.',
      },
    ],
  },
  {
    id: 'transport',
    title: 'Transport Readiness (SPAU / SPDD)',
    icon: '📦',
    color: 'check-transport',
    items: [
      {
        id: 'tr-1',
        label: 'Collect and document all active modification adjustment transports (SPDD)',
        detail:
          'SPDD handles ABAP Dictionary object adjustments (tables, structures, data elements). These must be re-adjusted after upgrade. Have the responsible developer available during the post-upgrade phase.',
      },
      {
        id: 'tr-2',
        label: 'Collect and document all SPAU modification adjustment transports',
        detail:
          'SPAU handles Repository object adjustments (programs, function modules, includes). Export current modifications before upgrade so they can be re-applied or re-evaluated post-upgrade.',
      },
      {
        id: 'tr-3',
        label: 'Freeze the transport landscape 48 hours before upgrade start',
        detail:
          'Stop all non-critical transports into the system being upgraded. Any transport imported during upgrade can corrupt the upgrade run. Coordinate with BASIS and application teams.',
      },
      {
        id: 'tr-4',
        label: 'Create a transport of copies (ToC) of all custom objects before upgrade',
        detail:
          'Export a backup transport of all custom Z/Y programs, exits, and BAdI implementations. This provides a rollback baseline if post-upgrade SPAU adjustments go wrong.',
      },
    ],
  },
  {
    id: 'downtime',
    title: 'Downtime Planning & Change Approvals',
    icon: '⏱️',
    color: 'check-downtime',
    items: [
      {
        id: 'dt-1',
        label: 'Obtain formal downtime approval from business stakeholders',
        detail:
          'S/4HANA upgrades require a planned maintenance window. Typical downtime for a production system ranges from 4–12 hours depending on data volume and system size. Get written approval from business owners and management before scheduling.',
      },
      {
        id: 'dt-2',
        label: 'Identify and document all technical break points in the upgrade',
        detail:
          'SUM (Software Update Manager) has defined break points where manual actions are required: (1) Pre-processing complete — verify before continuing; (2) Main import start — point of no return; (3) Post-processing — SPDD/SPAU adjustments; (4) Final checks — smoke test before opening to users. Assign a responsible person for each break point.',
      },
      {
        id: 'dt-3',
        label: 'Define a rollback plan and rollback decision deadline',
        detail:
          'Agree in advance on the cut-off time: if the upgrade has not reached post-processing by T+X hours, initiate rollback from the last HANA snapshot/backup. The rollback deadline must be documented and approved before the upgrade starts.',
      },
      {
        id: 'dt-4',
        label: 'Notify all dependent systems and interfaces of the maintenance window',
        detail:
          'Identify all RFC connections, IDocs, PI/PO interfaces, and third-party integrations that connect to this system. Send maintenance window notifications and ensure interface queues are drained before downtime begins.',
      },
      {
        id: 'dt-5',
        label: 'Schedule and complete a dry-run upgrade in a sandbox/QA system first',
        detail:
          'Never upgrade production without at least one successful dry run on a copy of the production system. The dry run validates the estimated downtime, uncovers SPDD/SPAU volume, and confirms the SUM tool version compatibility.',
      },
    ],
  },
]

interface Props {
  targetVersion: string
}

export default function PreUpgradeChecklist({ targetVersion }: Props) {
  return (
    <div className="checklist-wrap">
      <h3 className="checklist-heading">
        Pre-Upgrade Checklist
        <span className="checklist-sub">Complete all items before starting the upgrade to {targetVersion}</span>
      </h3>
      {CHECKLIST.map(section => (
        <div key={section.id} className={`checklist-section ${section.color}`}>
          <h4 className="checklist-section-title">
            {section.icon} {section.title}
          </h4>
          <ul className="checklist-items">
            {section.items.map(item => (
              <li key={item.id} className="checklist-item">
                <div className="checklist-item-label">
                  <span className="check-box">☐</span>
                  <strong>{item.label}</strong>
                </div>
                <p className="checklist-item-detail">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
