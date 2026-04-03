#!/usr/bin/env python3
import re
from pathlib import Path

import zhconv

INPUT_DIR = Path("五月天正规专辑歌词")
OUTPUT_DIR = Path("output_lyrics")


def extract_lyrics(content: str) -> list[str]:
    lines = []
    for line in content.splitlines():
        # Skip metadata lines like [ti:], [ar:], [al:], [by:]
        if re.match(r"^\[(ti|ar|al|by|offset|length):", line):
            continue
        # Remove all timestamps including negative offsets like [00:-05.70]
        lyric = re.sub(r"\[\d{2}:-?\d{2}\.\d{2}\]", "", line)
        lyric = lyric.strip()
        # Skip empty, pure metadata, or structural lines (title, artist, composer, etc.)
        if (
            lyric
            and not lyric.startswith("[")
            and not re.match(r"^(作词|作曲|编曲|制作|演唱|演奏|和声)", lyric)
        ):
            lines.append(lyric)
    return lines


def convert_to_traditional(s: str) -> str:
    return zhconv.convert(s, "zh-tw")


for album_dir in sorted(INPUT_DIR.iterdir()):
    if not album_dir.is_dir():
        continue
    album_name = album_dir.name
    # Extract album name without the prefix (e.g., "01_第一张创作专辑(1999)" -> "第一张创作专辑")
    match = re.match(r"^\d+_(.+)$", album_name)
    album_trad = convert_to_traditional(match.group(1)) if match else album_name

    output_album_dir = OUTPUT_DIR / album_trad
    output_album_dir.mkdir(parents=True, exist_ok=True)

    for lrc_file in sorted(album_dir.iterdir()):
        if lrc_file.suffix not in (".lrc", ".txt"):
            continue
        track_name = lrc_file.stem
        # Clean track name: remove Live version suffix, concert info, etc.
        track_clean = re.sub(r"（Live版）|\(Live版\)|_.*$", "", track_name)
        track_trad = convert_to_traditional(track_clean)

        content = lrc_file.read_text(encoding="utf-8")
        lyrics = extract_lyrics(content)

        output_file = output_album_dir / f"{track_trad}.txt"
        lyrics_trad = [convert_to_traditional(line) for line in lyrics]
        output_file.write_text("\n".join(lyrics_trad), encoding="utf-8")
        print(f"Saved: {output_file}")

print("Done!")
