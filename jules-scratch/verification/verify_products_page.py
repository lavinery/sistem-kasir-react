from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/auth/signin")
        page.fill('input[name="email"]', 'admin@kasir.com')
        page.fill('input[name="password"]', 'admin123')
        page.click('button[type="submit"]')
        page.wait_for_url("http://localhost:5173/")
        page.goto("http://localhost:5173/products")
        page.screenshot(path="jules-scratch/verification/products_page.png")
        browser.close()

if __name__ == "__main__":
    run_verification()
