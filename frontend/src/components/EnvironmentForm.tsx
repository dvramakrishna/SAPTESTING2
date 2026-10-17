import { useState } from 'react'
import type { AnalyzeRequest, OsType } from '../types'

interface Props {
  versions: string[]
  onSubmit: (req: AnalyzeRequest) => void
  loading: boolean
}

export default function EnvironmentForm({ versions, onSubmit, loading }: Props) {
  const [currentVersion, setCurrentVersion] = useState(versions[0] ?? '')
  const [targetVersion, setTargetVersion] = useState(versions[1] ?? '')
  const [hanaMajor, setHanaMajor] = useState<1 | 2>(2)
  const [hanaSps, setHanaSps] = useState(3)
  const [osType, setOsType] = useState<OsType>('RHEL')
  const [osMajor, setOsMajor] = useState(7)
  const [osMinor, setOsMinor] = useState(6)

  const currentIdx = versions.indexOf(currentVersion)
  const validTargets = versions.filter((_, i) => i > currentIdx)

  function handleCurrentChange(v: string) {
    setCurrentVersion(v)
    const idx = versions.indexOf(v)
    const newTargets = versions.filter((_, i) => i > idx)
    if (newTargets.length > 0 && !newTargets.includes(targetVersion)) {
      setTargetVersion(newTargets[0])
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      current_s4_version: currentVersion,
      target_s4_version: targetVersion,
      current_hana: { major: hanaMajor, sps: hanaSps },
      current_os: { os_type: osType, major: osMajor, minor: osMinor },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h2>Current Environment</h2>

      <div className="form-row">
        <label>
          Current S/4HANA Version
          <select value={currentVersion} onChange={e => handleCurrentChange(e.target.value)}>
            {versions.slice(0, -1).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label>
          Target S/4HANA Version
          <select value={targetVersion} onChange={e => setTargetVersion(e.target.value)}>
            {validTargets.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      <h2>HANA Database Version</h2>
      <div className="form-row">
        <fieldset>
          <legend>HANA Major Version</legend>
          {([1, 2] as const).map(m => (
            <label key={m} className="radio-label">
              <input
                type="radio"
                name="hanaMajor"
                value={m}
                checked={hanaMajor === m}
                onChange={() => setHanaMajor(m)}
              />
              HANA {m}.0
            </label>
          ))}
        </fieldset>

        <label>
          SPS Number
          <input
            type="number"
            min={0}
            max={99}
            value={hanaSps}
            onChange={e => setHanaSps(Number(e.target.value))}
          />
        </label>
      </div>

      <h2>Operating System</h2>
      <div className="form-row">
        <fieldset>
          <legend>OS Type</legend>
          {(['SLES', 'RHEL'] as OsType[]).map(t => (
            <label key={t} className="radio-label">
              <input
                type="radio"
                name="osType"
                value={t}
                checked={osType === t}
                onChange={() => setOsType(t)}
              />
              {t}
            </label>
          ))}
        </fieldset>

        <label>
          Major Version
          <input
            type="number"
            min={1}
            max={99}
            value={osMajor}
            onChange={e => setOsMajor(Number(e.target.value))}
          />
        </label>

        <label>
          {osType === 'SLES' ? 'SP Number' : 'Minor Version'}
          <input
            type="number"
            min={0}
            max={99}
            value={osMinor}
            onChange={e => setOsMinor(Number(e.target.value))}
          />
        </label>
      </div>

      <button type="submit" disabled={loading || validTargets.length === 0} className="submit-btn">
        {loading ? 'Analyzing…' : 'Analyze Upgrade Paths'}
      </button>
    </form>
  )
}
