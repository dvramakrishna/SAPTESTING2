from __future__ import annotations
from typing import Optional, Literal
from pydantic import BaseModel


class HanaVersion(BaseModel):
    major: int
    sps: int


class OsVersion(BaseModel):
    os_type: Literal["SLES", "RHEL"]
    major: int
    minor: int


class AnalyzeRequest(BaseModel):
    current_s4_version: str
    target_s4_version: str
    current_hana: HanaVersion
    current_os: OsVersion


class HanaGap(BaseModel):
    current_version_label: str
    required_version_label: str
    upgrade_needed: bool
    message: str


class OsGap(BaseModel):
    current_version_label: str
    is_supported: bool
    upgrade_needed: bool
    supported_versions_label: list[str]
    message: str


class HanaOsGap(BaseModel):
    """OS compatibility check for the TARGET HANA version (per SAP Note 2235581)."""
    hana_target_label: str
    os_current_label: str
    is_compatible: bool
    supported_os_for_hana: list[str]
    message: str
    note_reference: str


class SNote(BaseModel):
    number: str
    title: str
    category: str
    mandatory: bool
    description: str


class ActionStep(BaseModel):
    step: int
    component: Literal["OS", "HANA DB", "S/4HANA", "SAP Note"]
    action: str


class UpgradePath(BaseModel):
    path: list[str]
    is_direct: bool
    intermediate_hops: list[str]
    hana_gap: HanaGap
    os_gap: OsGap
    hana_os_gap: HanaOsGap
    action_plan: list[ActionStep]
    upgrade_possible: bool


class AnalyzeResponse(BaseModel):
    current_s4_version: str
    target_s4_version: str
    upgrade_paths: list[UpgradePath]
    snotes: list[SNote]
    error: Optional[str] = None


class VersionsResponse(BaseModel):
    versions: list[str]


class PrerequisitesResponse(BaseModel):
    version: str
    hana_min: dict
    supported_os: dict
    snotes: list[SNote]
