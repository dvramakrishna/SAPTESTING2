import type { ActionStep } from '../types'

interface Props {
  steps: ActionStep[]
}

const componentColor: Record<string, string> = {
  OS: 'step-os',
  'HANA DB': 'step-hana',
  'S/4HANA': 'step-s4',
}

export default function ActionPlanSteps({ steps }: Props) {
  if (steps.length === 0) {
    return <p className="no-action">No upgrade actions required — your environment already meets all prerequisites.</p>
  }

  return (
    <ol className="action-list">
      {steps.map(s => (
        <li key={s.step} className="action-item">
          <span className={`component-tag ${componentColor[s.component] ?? ''}`}>
            {s.component}
          </span>
          {s.action}
        </li>
      ))}
    </ol>
  )
}
