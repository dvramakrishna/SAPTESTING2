from fastapi import APIRouter, HTTPException
from services.data_loader import load_data
from models.schemas import VersionsResponse, PrerequisitesResponse, SNote

router = APIRouter()


@router.get("/versions", response_model=VersionsResponse)
def get_versions():
    data = load_data()
    return VersionsResponse(versions=data["s4hana_versions"])


@router.get("/versions/{version}/prerequisites", response_model=PrerequisitesResponse)
def get_prerequisites(version: str):
    data = load_data()
    if version not in data["s4hana_versions"]:
        raise HTTPException(status_code=404, detail=f"Unknown version: {version}")
    raw_snotes = data.get("snotes", {}).get(version, [])
    return PrerequisitesResponse(
        version=version,
        hana_min=data["hana_prerequisites"][version],
        supported_os=data["os_prerequisites"][version],
        snotes=[SNote(**n) for n in raw_snotes],
    )

