from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import archetypes, market_value, tactical_fit, shortlist

app = FastAPI(title="Soccer Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(archetypes.router, prefix="/api/archetypes", tags=["Archetypes"])
app.include_router(market_value.router, prefix="/api/market-value", tags=["Market Value"])
app.include_router(tactical_fit.router, prefix="/api/tactical-fit", tags=["Tactical Fit"])
app.include_router(shortlist.router, prefix="/api/shortlist", tags=["Shortlist"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
