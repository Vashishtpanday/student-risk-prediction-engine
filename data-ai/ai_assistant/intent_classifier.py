"""Simple intent classifier for faculty queries."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Dict, Optional

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from ai_assistant.query_parser import parse_query


def classify_query(query: str) -> Dict[str, Optional[str]]:
    """Return a parsed intent payload for the provided query."""
    return parse_query(query)
