import type { AnalyzeRequest, AnalyzeResponse } from '../types'

const BASE_URL = '/api'

export async function fetchVersions(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/versions`)
  if (!res.ok) throw new Error('Failed to fetch versions')
  const data = await res.json()
  return data.versions
}

export async function analyzeUpgrade(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Analysis request failed')
  }
  return res.json()
}
