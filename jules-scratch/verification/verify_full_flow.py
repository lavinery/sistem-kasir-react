import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # 1. Login
            await page.goto("http://localhost:5173/signin", timeout=30000)
            await page.fill('input[type="email"]', 'admin@kasir.com')
            await page.fill('input[type="password"]', 'admin123')
            await page.click('button[type="submit"]')

            # Wait for dashboard to load
            await expect(page.get_by_role("link", name="Dashboard")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/01_dashboard.png")
            print("Login successful, dashboard loaded.")

            # 2. Product Page
            await page.click('a[href="/products"]')
            await expect(page.get_by_role("heading", name="Products")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/02_products.png")
            print("Product page loaded.")

            # 3. Category Page
            await page.click('a[href="/categories"]')
            await expect(page.get_by_role("heading", name="Categories")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/03_categories.png")
            print("Category page loaded.")

            # 4. Member Page
            await page.click('a[href="/members"]')
            await expect(page.get_by_role("heading", name="Members")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/04_members.png")
            print("Member page loaded.")

            # 5. POS Page
            await page.click('a[href="/pos"]')
            await expect(page.get_by_role("heading", name="Produk")).to_be_visible(timeout=15000)
            await page.screenshot(path="jules-scratch/verification/05_pos.png")
            print("POS page loaded.")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
