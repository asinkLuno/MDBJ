import asyncio
import os
from playwright.async_api import async_playwright

CHROME_USER_DATA_DIR = os.path.expanduser("~/Library/Application Support/Google/Chrome")

async def get_token():
    async with async_playwright() as p:
        try:
            context = await p.chromium.launch_persistent_context(
                user_data_dir=CHROME_USER_DATA_DIR,
                channel="chrome",
                headless=True,
            )
            page = await context.new_page()
            await page.goto("https://www.musixmatch.com/")
            
            # Extract usertoken from local storage or cookies
            # Musixmatch often stores it in localStorage or as a cookie 'mxm-user-token'
            cookies = await context.cookies()
            mxm_token = next((c['value'] for c in cookies if 'mxm' in c['name'].lower() and 'token' in c['name'].lower()), None)
            
            # Also try local storage
            ls_token = await page.evaluate("() => localStorage.getItem('mxm:user:token')")
            
            print(f"Cookie Token: {mxm_token}")
            print(f"LocalStorage Token: {ls_token}")
            
            await context.close()
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(get_token())
