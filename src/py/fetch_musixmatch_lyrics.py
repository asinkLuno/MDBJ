import asyncio
import json
import os
import random
import re

from playwright.async_api import async_playwright

try:
    from song_lyrics import (  # type: ignore[reportImplicitRelativeImport]
        SONGS_5525,
        SONGS_5526,
    )
except ImportError:
    from .song_lyrics import (  # type: ignore[reportImplicitRelativeImport]
        SONGS_5525,
        SONGS_5526,
    )

ALL_SONGS = sorted(list(SONGS_5525.union(SONGS_5526)))
OUTPUT_DIR = "resources/lyrics/musixmatch"
FIREFOX_PROFILE_DIR = os.path.expanduser(
    "~/Library/Application Support/Firefox/Profiles/gjie3si5.default-release"
)


async def fetch_lyrics(page, song_name):
    lyrics_url = f"https://www.musixmatch.com/lyrics/五月天/{song_name}"
    print(f"Fetching: {lyrics_url}")

    try:
        await page.goto(lyrics_url, wait_until="networkidle", timeout=30000)
        await asyncio.sleep(3)

        body = await page.evaluate("() => document.body.innerText")
        lines = body.split("\n")

        start = next(
            (i for i, line in enumerate(lines) if line.strip().startswith("Lyrics of")),
            None,
        )
        end = next(
            (
                i
                for i, line in enumerate(lines)
                if i > (start or 0)
                and re.search(r"Writer|About|Translation|Embed|Report", line)
            ),
            None,
        )

        if start is None:
            print(f"  Could not find lyrics section for {song_name}")
            return None

        lyrics_lines = [ln.strip() for ln in lines[start + 1 : end] if ln.strip()]
        if not lyrics_lines:
            print(f"  Empty lyrics for {song_name}")
            return None

        return "\n".join(lyrics_lines)

    except Exception as e:
        print(f"  Error fetching {song_name}: {e}")
        return None


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    summary_path = os.path.join(OUTPUT_DIR, "summary.json")
    results_summary = {}
    if os.path.exists(summary_path):
        with open(summary_path, "r", encoding="utf-8") as f:
            try:
                results_summary = json.load(f)
            except Exception:
                pass

    async with async_playwright() as p:
        context = await p.firefox.launch_persistent_context(
            user_data_dir=FIREFOX_PROFILE_DIR,
            headless=False,
            slow_mo=300,
            args=["-allow-downgrade"],
        )
        page = await context.new_page()

        for song in ALL_SONGS:
            file_path = os.path.join(OUTPUT_DIR, f"{song}.txt")
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                print(f"Skip {song} (exists)")
                continue

            lyrics = await fetch_lyrics(page, song)

            if lyrics:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(lyrics)
                print(f"  Saved {song}")
                results_summary[song] = "success"
            else:
                results_summary[song] = "failed"

            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump(results_summary, f, ensure_ascii=False, indent=2)

            wait = random.uniform(5, 12)
            print(f"  Wait {wait:.1f}s\n")
            await asyncio.sleep(wait)

        await context.close()
        print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
