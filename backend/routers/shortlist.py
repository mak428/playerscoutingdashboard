from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# In-memory store (persists for the lifetime of the server process).
# The frontend also mirrors this in localStorage for resilience.
_shortlist: List[dict] = []


class ShortlistEntry(BaseModel):
    player: str
    pos: str | None = None
    team: str | None = None
    comp: str | None = None
    age: float | None = None
    archetype: str | None = None


@router.get("")
def get_shortlist():
    return _shortlist


@router.post("")
def add_to_shortlist(entry: ShortlistEntry):
    if any(p["player"] == entry.player for p in _shortlist):
        raise HTTPException(status_code=409, detail="Player already in shortlist")
    _shortlist.append(entry.model_dump())
    return {"message": f"{entry.player} added to shortlist"}


@router.delete("/{player_name}")
def remove_from_shortlist(player_name: str):
    global _shortlist
    before = len(_shortlist)
    _shortlist = [p for p in _shortlist if p["player"] != player_name]
    if len(_shortlist) == before:
        raise HTTPException(status_code=404, detail="Player not found in shortlist")
    return {"message": f"{player_name} removed from shortlist"}


@router.delete("")
def clear_shortlist():
    _shortlist.clear()
    return {"message": "Shortlist cleared"}
