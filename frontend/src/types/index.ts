export type OsType = 'SLES' | 'RHEL'

export interface HanaVersion {
  major: number
  sps: number
}

export interface OsVersion {
  os_type: OsType
  major: number
  minor: number
}

export interface AnalyzeRequest {
  current_s4_version: string
  target_s4_version: string
  current_hana: HanaVersion
  current_os: OsVersion
}

export interface HanaGap {
  current_version_label: string
  required_version_label: string
  upgrade_needed: boolean
  message: string
}

export interface OsGap {
  current_version_label: string
  is_supported: boolean
  upgrade_needed: boolean
  supported_versions_label: string[]
  message: string
}

export interface HanaOsGap {
  hana_target_label: string
  os_current_label: string
  is_compatible: boolean
  supported_os_for_hana: string[]
  message: string
  note_reference: string
}

export interface SNote {
  number: string
  title: string
  category: string
  mandatory: boolean
  description: string
}

export interface ActionStep {
  step: number
  component: 'OS' | 'HANA DB' | 'S/4HANA' | 'SAP Note'
  action: string
}

export interface UpgradePath {
  path: string[]
  is_direct: boolean
  intermediate_hops: string[]
  hana_gap: HanaGap
  os_gap: OsGap
  hana_os_gap: HanaOsGap
  action_plan: ActionStep[]
  upgrade_possible: boolean
}

export interface AnalyzeResponse {
  current_s4_version: string
  target_s4_version: string
  upgrade_paths: UpgradePath[]
  snotes: SNote[]
  error: string | null
}

