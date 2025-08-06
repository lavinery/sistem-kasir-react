from playwright.sync_api import sync_playwright
import time

def run_verification():
    with sync_playwright() as p:
        time.sleep(5)
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/auth/signin")
        page.wait_for_selector('input[name="email"]')
        page.fill('input[name="email"]', 'admin@kasir.com')
        page.fill('input[name="password"]', 'admin123')
        page.click('button[type="submit"]')
        page.wait_for_url("http://localhost:5173/")
        page.goto("http://localhost:5173/")
        page.screenshot(path="/app/jules-scratch/verification/dashboard_page.png")
        browser.close()

if __name__ == "__main__":
    run_verification()
