import json
import functools
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "compatibility_data.json"

@functools.lru_cache(maxsize=1)
def load_data() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)
