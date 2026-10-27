import type { UpgradePath } from '../types'
import GapAnalysisTable from './GapAnalysisTable'
import ActionPlanSteps from './ActionPlanSteps'
import PreUpgradeChecklist from './PreUpgradeChecklist'

interface Props {
  path: UpgradePath
  index: number
}

export default function UpgradePathCard({ path, index }: Props) {
  const pathLabel = path.path.join(' → ')
  const badge = path.is_direct
    ? <span className="badge badge-direct">Direct</span>
    : <span className="badge badge-hop">Via {path.intermediate_hops.join(', ')}</span>

  const hasIssues = path.hana_gap.upgrade_needed || path.os_gap.upgrade_needed || !path.hana_os_gap.is_compatible

  return (
    <div className={`path-card ${hasIssues ? 'path-card-issues' : 'path-card-ok'}`}>
      <div className="path-header">
        <h3>Path {index + 1}: {pathLabel}</h3>
        {badge}
        {hasIssues
          ? <span className="badge badge-warn">Prerequisites needed</span>
          : <span className="badge badge-ok">Ready to upgrade</span>
        }
      </div>

      <section>
        <h4>Gap Analysis</h4>
        <GapAnalysisTable hanaGap={path.hana_gap} osGap={path.os_gap} hanaOsGap={path.hana_os_gap} />
      </section>

      <section>
        <h4>Action Plan</h4>
        <ActionPlanSteps steps={path.action_plan} />
      </section>

      <section>
        <PreUpgradeChecklist targetVersion={path.path[path.path.length - 1]} />
      </section>
    </div>
  )
}

