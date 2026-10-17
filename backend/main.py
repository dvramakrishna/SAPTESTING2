from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import versions, analyze

app = FastAPI(title="SAP S/4HANA Upgrade Advisor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(versions.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
