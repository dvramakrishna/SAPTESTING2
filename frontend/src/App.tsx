import { useEffect, useState } from 'react'
import { fetchVersions, analyzeUpgrade } from './api/client'
import type { AnalyzeRequest, AnalyzeResponse } from './types'
import EnvironmentForm from './components/EnvironmentForm'
import UpgradePathCard from './components/UpgradePathCard'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

export default function App() {
  const [versions, setVersions] = useState<string[]>([])
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVersions()
      .then(setVersions)
      .catch(() => setError('Failed to connect to backend. Make sure the server is running on port 8000.'))
  }, [])

  async function handleAnalyze(req: AnalyzeRequest) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await analyzeUpgrade(req)
      if (res.error) {
        setError(res.error)
      } else {
        setResult(res)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>SAP S/4HANA Upgrade Advisor</h1>
        <p>Enter your current environment and target version to get a full upgrade path analysis.</p>
      </header>

      <main className="app-main">
        {versions.length > 0 && (
          <EnvironmentForm versions={versions} onSubmit={handleAnalyze} loading={loading} />
        )}

        {error && <div className="error-banner">{error}</div>}

        {loading && <LoadingSpinner />}

        {result && !loading && (
          <section className="results">
            <h2>
              Upgrade Paths: {result.current_s4_version} → {result.target_s4_version}
              <span className="path-count">{result.upgrade_paths.length} path{result.upgrade_paths.length !== 1 ? 's' : ''} found</span>
            </h2>
            {result.upgrade_paths.map((p, i) => (
              <UpgradePathCard key={i} path={p} index={i} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
