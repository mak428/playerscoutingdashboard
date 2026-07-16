import unicodedata
from functools import lru_cache
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Query

from data_paths import GK_ARCHETYPE, DEF_ARCHETYPE, MID_ARCHETYPE, FWD_ARCHETYPE

router = APIRouter()

ARCHETYPE_COLS = ["Player", "Pos", "Season", "Age", "Team", "Comp", "Ideal Archetype"]

POSITION_FILES = {
    "GK": GK_ARCHETYPE,
    "DEF": DEF_ARCHETYPE,
    "MID": MID_ARCHETYPE,
    "FWD": FWD_ARCHETYPE,
}

ARCHETYPES_BY_POSITION = {
    "GK": ["Sweeper Keeper", "Modern GK", "Classic GK"],
    "DEF": [
        "Libero", "Ball Playing Center Back", "Central Defender",
        "Classic Defender", "Classic Full Back", "Wing Back", "Inverted Wing Back",
    ],
    "MID": [
        "Classic CM", "Regista", "Box-to-Box", "Segundo Volante", "Mezzala",
        "Deep Lying Playmaker", "Ball Winning Midfielder", "Anchor Man",
        "Attacking Midfielder", "Advanced Playmaker", "Wide Midfielder", "Wide Playmaker",
    ],
    "FWD": [
        "Classic Winger", "Inverted Winger", "Inside Forward", "Target Man",
        "Complete Forward", "Poacher", "Second Striker", "False Nine",
    ],
}

ARCHETYPE_DESCRIPTIONS = {
    "Sweeper Keeper": "These goalkeepers clean up balls from out wide or come out far; potentially even outside their box to play as an extra player or to initiate passes and start counter-attacks with direct through balls.",
    "Modern GK": "These goalkeepers have a greater emphasis on distribution, with more short passes and key passes, and less number of long-launched goalkicks.",
    "Classic GK": "These goalkeepers are excellent shot-stoppers, but have less of an emphasis placed on distribution. They will have a much higher launch %, meaning they do more long kicks.",
    "Libero": "The libero literally means 'to sweep'. They will stay behind the defensive line, looking to sweep up through balls, pick up extra forward players and make goal saving plays.",
    "Ball Playing Center Back": "This is the more common role seen in modern football with defenders having to play out of the back and be excellent in passing.",
    "Central Defender": "Main job is to clear the ball from danger when needed to. In certain tactics this includes being good on the feet and maintaining possession.",
    "Classic Defender": "The 'old-school' role of a defender with only one thing in mind: clear it and stop attacks. The goal of the defender with this duty is to win the ball and get it cleared up the field and take no risks in doing so.",
    "Classic Full Back": "The full back remains primarily a defensive player but will move forward when the team needs extra width. They are also more of a supportive role when going forward.",
    "Wing Back": "The wing back fulfills both the attacking duties of a winger and the defensive duties of a full back. They are seen up and down the wide positions on the pitch.",
    "Inverted Wing Back": "An inverted wing back will line up as a standard wide defender, but they will move in field when in possession rather than stick wide to either create space or be an extra passing option.",
    "Classic CM": "The central midfielder is the link player and a hard worker. Rather than being more technically adept like a box-to-box midfielder, the central midfielder will perform various roles based on instruction.",
    "Regista": "Like a Deep Lying Playmaker but has way more freedom. Overall an aggressive, fast-paced midfielder who will look to press high, dictate the play from deep positions.",
    "Box-to-Box": "The 'workhorse' of the midfield. Their attributes allow these players to contribute on all avenues of the pitch; attacking means their surging late into the box, have killer passes and provide a threat from distance.",
    "Segundo Volante": "A direct translation for Segundo Volante is 'Second Steering Wheel'. This archetype is mainly a defensive role and a late support when going forward.",
    "Mezzala": "The direct translation is 'wing half or half winger'. So, this player is a central player that likes to drift wide but not too far wide as they are only a 'half wing': meaning they operate in the half-spaces.",
    "Deep Lying Playmaker": "Operates in the spaces between the defense and midfield. They aim to start attacking plays by passing out to players or spaces further up the pitch.",
    "Ball Winning Midfielder": "The ball winning midfielder has the main role of closing-down the opposition and winning the ball back.",
    "Anchor Man": "The main duty of this player is to sit between the defense and midfield. Their main job is to win the ball, intercept moves, runs and if recouping the ball, pass it on to a more creative player.",
    "Attacking Midfielder": "Plays just in front of the central midfield role, therefore they are not found in deeper positions. They use their technical and mental abilities to create chances.",
    "Advanced Playmaker": "This player will look to find space in-between the oppositions midfield and defense. Their main role is to be available for their teammates, whether that is to pass to or run into an open space.",
    "Wide Midfielder": "The stereotypical player in a standard 4-4-2, performing both the defensive and attacking duties out wide. They are supportive players who perform work for all three avenues of the pitch.",
    "Wide Playmaker": "The wide playmaker is a dual role. In possession, the player will be a source of creativity by drifting inside or out wide to find space and therefore a chance.",
    "Classic Winger": "A winger primarily sticks wide towards the sideline, bombs forward either with the ball or beats the opposition and attacks the byline.",
    "Inverted Winger": "The Inverted Winger has the goal of creating and opening space for onrushing wide players such as the full backs. They will look to create and focus on their stronger foot.",
    "Inside Forward": "More of a common sight in the modern game, the goal of an inside forward is to run from out wide towards the center of the opposition defense and penalty box.",
    "Target Man": "The physical 'big-man' up front who is a 'nuisance' for defenders. Ideally the play is brought to them to open up more attacking play.",
    "Complete Forward": "The 'all-round forward', they can shoot, hold up the ball, have that ability to be in the right place at the right time AND can pass the ball.",
    "Poacher": "The main goal is to break past the defensive line and score goals. They will make runs and plays where their instincts will create opportunities both inside and around the box.",
    "Second Striker": "Best suited with a partner upfront, the Second Striker is a goal-scorer. They look to find themselves in goal scoring positions outside that of their partner striker.",
    "False Nine": "A striker or center forward who drops deep into midfield. They do this to drag opposition defenders out of position, exploit space and create lanes for other attacking players.",
}


def _normalize(text: str) -> str:
    if not isinstance(text, str):
        text = str(text)
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).casefold()


@lru_cache(maxsize=4)
def _load(position: str) -> pd.DataFrame:
    path = POSITION_FILES[position]
    df = pd.read_csv(path)
    available = [c for c in ARCHETYPE_COLS if c in df.columns]
    return df[available].copy()


@router.get("/positions")
def get_positions():
    return [
        {"key": "GK", "label": "Goalkeeper"},
        {"key": "DEF", "label": "Defender"},
        {"key": "MID", "label": "Midfielder"},
        {"key": "FWD", "label": "Forward"},
    ]


@router.get("/archetypes")
def get_archetypes(position: str = Query(...)):
    pos = position.upper()
    archetypes = ARCHETYPES_BY_POSITION.get(pos, [])
    return [
        {"archetype": a, "description": ARCHETYPE_DESCRIPTIONS.get(a, "")}
        for a in archetypes
    ]


@router.get("/players")
def get_players(
    position: str = Query(...),
    archetype: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    pos = position.upper()
    df = _load(pos).copy()

    if archetype:
        df = df[df["Ideal Archetype"] == archetype]

    if search:
        norm = _normalize(search)
        df = df[df["Player"].apply(lambda x: norm in _normalize(x))]

    return df.where(pd.notna(df), None).to_dict(orient="records")


@router.get("/distribution")
def get_distribution(position: str = Query(...)):
    """Returns archetype counts for a position (used for bar chart)."""
    pos = position.upper()
    df = _load(pos)
    counts = df["Ideal Archetype"].value_counts().reset_index()
    counts.columns = ["archetype", "count"]
    return counts.to_dict(orient="records")
