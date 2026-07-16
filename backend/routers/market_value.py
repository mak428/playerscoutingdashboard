import unicodedata
from functools import lru_cache
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Query

from data_paths import MARKET_VALUE_FORECAST

router = APIRouter()


def _normalize(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).casefold()


@lru_cache(maxsize=1)
def _load() -> pd.DataFrame:
    df = pd.read_csv(MARKET_VALUE_FORECAST)
    df["Forecast Date"] = pd.to_datetime(df["Forecast Date"], errors="coerce")
    df["Predicted Market Value"] = pd.to_numeric(df["Predicted Market Value"], errors="coerce")
    df["Forecasted Market Value"] = pd.to_numeric(df["Forecasted Market Value"], errors="coerce")
    df["Current Market Value"] = pd.to_numeric(df["Current Market Value"], errors="coerce")
    return df.dropna(subset=["Forecast Date", "Predicted Market Value"])


@router.get("/search")
def search_players(q: Optional[str] = Query(None)):
    """Returns matching player names for the search dropdown."""
    df = _load()
    if q:
        norm = _normalize(q)
        players = df[df["Player"].apply(lambda x: norm in _normalize(x))]["Player"].unique()
    else:
        players = df["Player"].unique()
    return sorted(players.tolist())[:50]


@router.get("/forecast")
def get_forecast(player: str = Query(...)):
    """Returns the 5-year forecast rows for a single player."""
    df = _load()
    rows = df[df["Player"] == player].sort_values("Forecast Date").copy()
    if rows.empty:
        return {"player": player, "forecast": [], "meta": None}

    rows["Forecast Date"] = rows["Forecast Date"].dt.strftime("%Y-%m-%d")
    meta_row = rows.iloc[0]
    meta = {
        "player": player,
        "position": meta_row.get("PositionGroup"),
        "lastKnownTeam": meta_row.get("Last Known Team"),
        "lastKnownAge": meta_row.get("Last Known Age"),
        "currentMarketValue": meta_row.get("Current Market Value"),
        "estimatedPeakValue": meta_row.get("Estimated Peak Value"),
        "bestModel": meta_row.get("Best Model"),
    }
    forecast = rows[["Forecast Year Ahead", "Forecast Date", "Forecasted Market Value"]].to_dict(
        orient="records"
    )
    return {"player": player, "meta": meta, "forecast": forecast}
