"""Absolute paths to the pre-computed CSV data files."""
import os

_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Archetype CSVs
GK_ARCHETYPE = os.path.join(_ROOT, "Archetype Classification", "Classified Archetypes", "GKArchetypes.csv")
DEF_ARCHETYPE = os.path.join(_ROOT, "Archetype Classification", "Classified Archetypes", "DefenderArchetypes.csv")
MID_ARCHETYPE = os.path.join(_ROOT, "Archetype Classification", "Classified Archetypes", "MidfielderArchetypes.csv")
FWD_ARCHETYPE = os.path.join(_ROOT, "Archetype Classification", "Classified Archetypes", "ForwardArchetypes.csv")
COMBINED_ARCHETYPE = os.path.join(_ROOT, "Archetype Classification", "CombinedArchetypes.csv")

# Market value forecast
MARKET_VALUE_FORECAST = os.path.join(
    _ROOT, "Market Value Forecast Data", "ensemble_player_forecasts_5y_adjusted_full.csv"
)

# Tactical fit scores
TACTICAL_FIT = os.path.join(
    _ROOT, "Tactical System Fit Score", "all_players_system_fit_scores_20260620_135759.csv"
)
