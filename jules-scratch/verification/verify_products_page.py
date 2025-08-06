import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Go to the signin page
            await page.goto("http://localhost:5173/signin", timeout=30000)

            # Fill in the login form using placeholder selectors
            await page.get_by_placeholder("admin@kasir.com").fill("admin@kasir.com")
            await page.get_by_placeholder("Enter your password").fill("admin123")

            # Click the sign in button
            await page.get_by_role("button", name="Sign in").click()

            # Wait for navigation to the dashboard and for the sidebar to be ready
            await expect(page.get_by_role("link", name="Dashboard")).to_be_visible(timeout=15000)

            # Click on the "Products" link in the sidebar
            await page.get_by_role("link", name="Products").click()

            # Wait for the products page to load
            await expect(page.get_by_role("heading", name="Products")).to_be_visible(timeout=15000)

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/products_page.png")

            print("Screenshot of products page taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Take a screenshot even if it fails to see the state
            await page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
