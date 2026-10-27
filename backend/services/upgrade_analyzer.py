from collections import deque
from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, UpgradePath,
    HanaGap, OsGap, HanaOsGap, ActionStep, SNote,
)


def compare_hana(current: dict, required: dict) -> bool:
    if current["major"] != required["major"]:
        return current["major"] > required["major"]
    return current["sps"] >= required["sps"]


def os_is_supported(current_os: dict, os_prereqs: dict) -> bool:
    if not os_prereqs:
        return True
    os_type = current_os["os_type"]
    if os_type not in os_prereqs:
        return False
    for constraint in os_prereqs[os_type]:
        if current_os["major"] != constraint["major"]:
            continue
        minor = current_os["minor"]
        sp_min = constraint.get("sp_min", constraint.get("minor_min", 0))
        sp_max = constraint.get("sp_max", constraint.get("minor_max", None))
        if minor < sp_min:
            continue
        if sp_max is not None and minor > sp_max:
            continue
        return True
    return False


def find_all_paths(source: str, target: str, upgrade_paths: dict) -> list[list[str]]:
    queue = deque([[source]])
    all_paths = []
    while queue and len(all_paths) < 20:
        path = queue.popleft()
        current = path[-1]
        for neighbor in upgrade_paths.get(current, []):
            new_path = path + [neighbor]
            if neighbor == target:
                all_paths.append(new_path)
            elif len(new_path) < 10:
                queue.append(new_path)
    return all_paths


def _hana_label(h: dict) -> str:
    return f"HANA {h['major']}.0 SPS{h['sps']:02d}"


def _os_label(os: dict) -> str:
    return f"{os['os_type']} {os['major']}.{os['minor']}"


def _supported_os_labels(os_prereqs: dict) -> list[str]:
    labels = []
    for os_type, constraints in os_prereqs.items():
        for c in constraints:
            sp_min = c.get("sp_min", c.get("minor_min", 0))
            sp_max = c.get("sp_max", c.get("minor_max", None))
            if sp_max is None:
                labels.append(f"{os_type} {c['major']}.{sp_min}+")
            elif sp_min == sp_max:
                labels.append(f"{os_type} {c['major']} SP{sp_min}")
            else:
                labels.append(f"{os_type} {c['major']}.{sp_min}-{sp_max}")
    return labels


def _build_hana_gap(current_hana: dict, target_version: str, data: dict) -> HanaGap:
    required = data["hana_prerequisites"][target_version]
    current_label = _hana_label(current_hana)
    required_label = _hana_label(required)
    upgrade_needed = not compare_hana(current_hana, required)
    if upgrade_needed:
        message = f"Upgrade HANA from {current_label} to minimum {required_label}"
    else:
        message = f"HANA {current_label} meets the minimum requirement of {required_label}"
    return HanaGap(
        current_version_label=current_label,
        required_version_label=required_label,
        upgrade_needed=upgrade_needed,
        message=message,
    )


def _build_os_gap(current_os: dict, target_version: str, data: dict) -> OsGap:
    os_prereqs = data["os_prerequisites"][target_version]
    current_label = _os_label(current_os)
    supported = os_is_supported(current_os, os_prereqs)
    supported_labels = _supported_os_labels(os_prereqs) if os_prereqs else ["No restriction"]
    if supported:
        message = f"{current_label} is supported on target {target_version}"
    else:
        message = (
            f"{current_label} is NOT supported on target {target_version} — "
            f"upgrade to one of: {', '.join(supported_labels)}"
        )
    return OsGap(
        current_version_label=current_label,
        is_supported=supported,
        upgrade_needed=not supported,
        supported_versions_label=supported_labels,
        message=message,
    )


def _hana_os_matrix_key(hana: dict) -> str | None:
    """Map a HANA version dict to a key in the hana_os_compatibility matrix."""
    major = hana["major"]
    sps = hana["sps"]
    if major != 2:
        return None
    if sps <= 5:
        return "2_sps05"
    if sps == 6:
        return "2_sps06"
    if sps == 7:
        return "2_sps07"
    if sps == 8:
        return "2_sps08"
    return "2_sps09"


def _build_hana_os_gap(current_os: dict, target_hana: dict, data: dict) -> HanaOsGap:
    """Check whether the current OS is compatible with the TARGET HANA version (SAP Note 2235581)."""
    hana_compat = data.get("hana_os_compatibility", {})
    note_ref = hana_compat.get("note", "2235581")
    matrix = hana_compat.get("matrix", {})
    hana_label = _hana_label(target_hana)
    os_label = _os_label(current_os)
    matrix_key = _hana_os_matrix_key(target_hana)

    if matrix_key is None or matrix_key not in matrix:
        return HanaOsGap(
            hana_target_label=hana_label,
            os_current_label=os_label,
            is_compatible=True,
            supported_os_for_hana=["See SAP Note 2235581 for HANA 1.x"],
            message=f"OS compatibility for {hana_label} requires manual check — see SAP Note {note_ref}",
            note_reference=note_ref,
        )

    os_prereqs = matrix[matrix_key]
    compatible = os_is_supported(current_os, os_prereqs)
    supported_labels = _supported_os_labels(os_prereqs)

    if compatible:
        message = (
            f"{os_label} is certified for {hana_label} per SAP Note {note_ref}"
        )
    else:
        message = (
            f"{os_label} is NOT certified for {hana_label} (SAP Note {note_ref}). "
            f"Upgrade OS first to one of: {', '.join(supported_labels)}"
        )

    return HanaOsGap(
        hana_target_label=hana_label,
        os_current_label=os_label,
        is_compatible=compatible,
        supported_os_for_hana=supported_labels,
        message=message,
        note_reference=note_ref,
    )


def _build_action_plan(
    path: list[str],
    hana_gap: HanaGap,
    os_gap: OsGap,
    hana_os_gap: HanaOsGap,
) -> list[ActionStep]:
    steps = []
    step = 1

    if os_gap.upgrade_needed or not hana_os_gap.is_compatible:
        supported = (
            os_gap.supported_versions_label
            if os_gap.upgrade_needed
            else hana_os_gap.supported_os_for_hana
        )
        steps.append(ActionStep(
            step=step,
            component="OS",
            action=(
                f"Upgrade OS from {os_gap.current_version_label} to a supported version: "
                f"{', '.join(supported)}"
            ),
        ))
        step += 1

    if hana_gap.upgrade_needed:
        steps.append(ActionStep(
            step=step,
            component="HANA DB",
            action=(
                f"Upgrade HANA DB from {hana_gap.current_version_label} "
                f"to minimum {hana_gap.required_version_label} "
                f"(verify OS compatibility via SAP Note {hana_os_gap.note_reference})"
            ),
        ))
        step += 1

    for i in range(len(path) - 1):
        steps.append(ActionStep(
            step=step,
            component="S/4HANA",
            action=f"Upgrade S/4HANA from {path[i]} to {path[i + 1]}",
        ))
        step += 1

    return steps


def analyze(request: AnalyzeRequest, data: dict) -> AnalyzeResponse:
    versions = data["s4hana_versions"]

    if request.current_s4_version not in versions:
        return AnalyzeResponse(
            current_s4_version=request.current_s4_version,
            target_s4_version=request.target_s4_version,
            upgrade_paths=[],
            snotes=[],
            error=f"Unknown source version: {request.current_s4_version}",
        )

    if request.target_s4_version not in versions:
        return AnalyzeResponse(
            current_s4_version=request.current_s4_version,
            target_s4_version=request.target_s4_version,
            upgrade_paths=[],
            snotes=[],
            error=f"Unknown target version: {request.target_s4_version}",
        )

    if request.current_s4_version == request.target_s4_version:
        return AnalyzeResponse(
            current_s4_version=request.current_s4_version,
            target_s4_version=request.target_s4_version,
            upgrade_paths=[],
            snotes=[],
            error="Source and target versions must differ",
        )

    paths = find_all_paths(
        request.current_s4_version,
        request.target_s4_version,
        data["upgrade_paths"],
    )

    if not paths:
        return AnalyzeResponse(
            current_s4_version=request.current_s4_version,
            target_s4_version=request.target_s4_version,
            upgrade_paths=[],
            snotes=[],
            error=(
                f"No valid upgrade path found from "
                f"{request.current_s4_version} to {request.target_s4_version}"
            ),
        )

    current_hana = request.current_hana.model_dump()
    current_os = request.current_os.model_dump()
    target = request.target_s4_version
    target_hana = data["hana_prerequisites"][target]

    upgrade_paths = []
    for path in paths:
        hana_gap = _build_hana_gap(current_hana, target, data)
        os_gap = _build_os_gap(current_os, target, data)
        hana_os_gap = _build_hana_os_gap(current_os, target_hana, data)
        action_plan = _build_action_plan(path, hana_gap, os_gap, hana_os_gap)
        intermediate = path[1:-1]
        upgrade_paths.append(UpgradePath(
            path=path,
            is_direct=len(path) == 2,
            intermediate_hops=intermediate,
            hana_gap=hana_gap,
            os_gap=os_gap,
            hana_os_gap=hana_os_gap,
            action_plan=action_plan,
            upgrade_possible=True,
        ))

    raw_snotes = data.get("snotes", {}).get(target, [])
    snotes = [SNote(**n) for n in raw_snotes]

    return AnalyzeResponse(
        current_s4_version=request.current_s4_version,
        target_s4_version=request.target_s4_version,
        upgrade_paths=upgrade_paths,
        snotes=snotes,
        error=None,
    )

