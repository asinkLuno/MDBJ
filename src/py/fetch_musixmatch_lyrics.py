import asyncio
import json
import os
import random
import re

from playwright.async_api import async_playwright

SONGS_5525 = [
    "OAOA",
    "孫悟空",
    "入陣曲",
    "乾杯",
    "瘋狂世界",
    "有些事現在不做一輩子都不會做了",
    "約翰藍儂",
    "志明與春嬌",
    "終結孤單",
    "憨人",
    "人生海海",
    "相信",
    "九號球",
    "恆星的恆心",
    "時光機",
    "讓我照顧你",
    "回來吧",
    "天使",
    "一千個世紀",
    "我心中尚未崩壞的地方",
    "我不願讓你一個人",
    "諾亞方舟",
    "成名在望",
    "DNA",
    "派對動物",
    "離開地球表面",
    "戀愛ING",
    "任性",
    "突然好想你",
    "轉眼",
    "任意門",
]

SONGS_5526 = [
    "OAOA",
    "孫悟空",
    "盛夏光年",
    "乾杯",
    "終結孤單",
    "有些事現在不做一輩子都不會做了",
    "約翰藍儂",
    "成名在望",
    "如果我們不曾相遇",
    "第二人生",
    "星空",
    "我心中尚未崩壞的地方",
    "最重要的小事",
    "超人",
    "九號球",
    "恆星的恆心",
    "時光機",
    "相信",
    "人生海海",
    "愛情萬歲",
    "瘋狂世界",
    "軋車",
    "派對動物",
    "離開地球表面",
    "戀戀ING",
    "任性",
    "突然好想你",
    "轉眼",
    "任意門",
]

SONG_RELEASE_DATES = {
    "OAOA": "2011-12-16",
    "孫悟空": "2004-11-05",
    "入陣曲": "2013-12-30",
    "乾杯": "2011-12-16",
    "瘋狂世界": "1999-07-07",
    "有些事現在不做一輩子都不會做了": "2011-12-16",
    "約翰藍儂": "2004-11-05",
    "志明與春嬌": "1999-07-07",
    "終結孤單": "2000-07-07",
    "憨人": "2000-07-07",
    "人生海海": "2001-07-06",
    "相信": "2001-07-06",
    "九號球": "2003-11-11",
    "恆星的恆心": "2003-11-11",
    "時光機": "2003-11-11",
    "讓我照顧你": "2004-11-05",
    "回來吧": "2004-11-05",
    "天使": "2006-12-29",
    "一千個世紀": "2006-12-29",
    "我心中尚未崩壞的地方": "2008-10-23",
    "我不願讓你一個人": "2011-12-16",
    "諾亞方舟": "2011-12-16",
    "成名在望": "2016-07-21",
    "DNA": "2009-06-17",
    "派對動物": "2016-07-21",
    "離開地球表面": "2007-07-20",
    "戀愛ING": "2005-08-26",
    "戀戀ING": "2005-08-26",
    "任性": "2022-11-01",
    "突然好想你": "2008-10-23",
    "轉眼": "2016-07-21",
    "任意門": "2016-07-21",
    "盛夏光年": "2006-10-13",
    "如果我們不曾相遇": "2016-07-21",
    "第二人生": "2011-12-16",
    "星空": "2011-12-16",
    "最重要的小事": "2006-12-29",
    "超人": "2004-11-05",
    "愛情萬歲": "2000-07-07",
    "軋車": "1999-07-07",
}

ALL_SONGS = list(SONG_RELEASE_DATES.keys())
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
