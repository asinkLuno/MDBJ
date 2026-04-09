import json
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent.parent / "resources" / "song_data.json"


def load_song_data():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


_data = load_song_data()
SONG_RELEASE_DATES = _data["SONG_RELEASE_DATES"]
