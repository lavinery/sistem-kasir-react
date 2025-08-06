from playwright.sync_api import sync_playwright
import time

def run_verification():
    with sync_playwright() as p:
        time.sleep(5)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/auth/signin")
        page.screenshot(path="/app/jules-scratch/verification/signin_page.png")
        browser.close()

if __name__ == "__main__":
    run_verification()
