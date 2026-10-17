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


class ActionStep(BaseModel):
    step: int
    component: Literal["OS", "HANA DB", "S/4HANA"]
    action: str


class UpgradePath(BaseModel):
    path: list[str]
    is_direct: bool
    intermediate_hops: list[str]
    hana_gap: HanaGap
    os_gap: OsGap
    action_plan: list[ActionStep]
    upgrade_possible: bool


class AnalyzeResponse(BaseModel):
    current_s4_version: str
    target_s4_version: str
    upgrade_paths: list[UpgradePath]
    error: Optional[str] = None


class VersionsResponse(BaseModel):
    versions: list[str]


class PrerequisitesResponse(BaseModel):
    version: str
    hana_min: dict
    supported_os: dict
