import unicodedata
from functools import lru_cache
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Query

from data_paths import TACTICAL_FIT

router = APIRouter()

FIT_COLS = [
    "Fit_Tiki_Taka_Possession",
    "Fit_Gegenpressing_Counter_Attack",
    "Fit_Low_Block_Defensive",
    "Fit_Wing_Play",
]

DISPLAY_LABELS = {
    "Fit_Tiki_Taka_Possession": "Tiki-Taka / Possession",
    "Fit_Gegenpressing_Counter_Attack": "Gegenpressing / Counter-Attack",
    "Fit_Low_Block_Defensive": "Low Block / Defensive",
    "Fit_Wing_Play": "Wing Play",
}


def _normalize(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).casefold()


@lru_cache(maxsize=1)
def _load() -> pd.DataFrame:
    df = pd.read_csv(TACTICAL_FIT)
    keep = ["Player", "Pos", "Season", "Age", "Team", "Comp", "Ideal Archetype"] + FIT_COLS
    available = [c for c in keep if c in df.columns]
    for col in FIT_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df[available].dropna(subset=FIT_COLS)


@router.get("/search")
def search_players(q: Optional[str] = Query(None)):
    df = _load()
    if q:
        norm = _normalize(q)
        players = df[df["Player"].apply(lambda x: norm in _normalize(x))]["Player"].unique()
    else:
        players = df["Player"].unique()
    return sorted(players.tolist())[:50]


@router.get("/player")
def get_player_fit(player: str = Query(...)):
    """Returns fit scores + radar chart data for a single player."""
    df = _load()
    rows = df[df["Player"] == player]
    if rows.empty:
        return {"player": player, "data": None}
    row = rows.iloc[0]
    fit_scores = {
        DISPLAY_LABELS[col]: round(float(row[col]), 4)
        for col in FIT_COLS
        if col in row.index and pd.notna(row[col])
    }
    return {
        "player": player,
        "pos": row.get("Pos"),
        "team": row.get("Team"),
        "comp": row.get("Comp"),
        "age": row.get("Age"),
        "archetype": row.get("Ideal Archetype"),
        "fitScores": fit_scores,
    }


@router.get("/players")
def get_players(
    search: Optional[str] = Query(None),
    position: Optional[str] = Query(None),
):
    """Returns a list of players with their fit scores for the table view."""
    df = _load().copy()

    if search:
        norm = _normalize(search)
        df = df[df["Player"].apply(lambda x: norm in _normalize(x))]

    if position and position.upper() != "ALL":
        df = df[df["Pos"].str.upper() == position.upper()]

    df = df.head(100)
    df = df.where(pd.notna(df), None)
    records = df.to_dict(orient="records")

    # Rename fit columns to display labels
    for r in records:
        for col, label in DISPLAY_LABELS.items():
            if col in r:
                r[label] = r.pop(col)

    return records
