import asyncio
from playwright.async_api import async_playwright

async def fetch_song_lyrics(browser, url, index):
    page = await browser.new_page()
    try:
        print(f"[{index}] Opening {url}...")
        # Use domcontentloaded or load if networkidle is too slow
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        
        # Give it a bit more time if needed
        await asyncio.sleep(2)

        selectors = [".lyrics", ".lyrics-content", "[class*='lyrics']"]
        lyrics_content = None
        
        for selector in selectors:
            try:
                # Shorter wait for internal elements
                await page.wait_for_selector(selector, timeout=5000)
                lyrics_content = await page.inner_text(selector)
                if lyrics_content:
                    break
            except Exception:
                continue

        if lyrics_content:
            song_title = await page.inner_text('h1') if await page.query_selector('h1') else f"song_{index}"
            # Sanitize filename
            safe_title = "".join([c for c in song_title.strip() if c.isalnum() or c in (' ', '.', '_')]).strip()
            filename = f"{index:02d}_{safe_title}.txt"
            filename = filename.replace(' ', '_')
            
            with open(filename, "w", encoding="utf-8") as f:
                f.write(lyrics_content.strip())
            print(f"   -> Saved to {filename}")
        else:
            print(f"   -> Failed to find lyrics for {url}")
    except Exception as e:
        print(f"   -> Error fetching {url}: {e}")
    finally:
        await page.close()

async def main():
    initial_url = "https://www.kkbox.com/tw/tc/song/CsfWv_xt3ZiY0dnT9M"
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print(f"Analyzing {initial_url} for song links...")
        try:
            await page.goto(initial_url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3) # Wait for JS to render links
            
            # Find song links
            links = await page.evaluate('''() => {
                const list = Array.from(document.querySelectorAll('a[href*="/song/"]'));
                return list.map(a => a.href);
            }''')
        except Exception as e:
            print(f"Failed to load initial page: {e}")
            await browser.close()
            return

        # Deduplicate and maintain order
        seen = set()
        unique_links = []
        for link in links:
            if link not in seen:
                unique_links.append(link)
                seen.add(link)
        
        print(f"Found {len(unique_links)} unique song links.")
        
        for i, link in enumerate(unique_links, 1):
            await fetch_song_lyrics(browser, link, i)
            # Add a small delay between songs
            await asyncio.sleep(1)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
