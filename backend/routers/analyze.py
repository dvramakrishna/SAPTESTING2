from fastapi import APIRouter
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.data_loader import load_data
from services.upgrade_analyzer import analyze

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_upgrade(request: AnalyzeRequest):
    data = load_data()
    return analyze(request, data)
