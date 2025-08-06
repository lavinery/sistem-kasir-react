import re
import time
from playwright.sync_api import Page, expect, sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Increase timeout for all actions
    page.set_default_timeout(15000)

    try:
        # 1. Login
        page.goto("http://localhost:5173/auth/signin")

        # Explicitly wait for the body to be ready
        page.wait_for_selector("body")

        # Wait for the specific element with a longer timeout
        email_input = page.get_by_placeholder("admin@kasir.com")
        expect(email_input).to_be_visible(timeout=15000)

        email_input.fill("admin@kasir.com")
        page.get_by_placeholder("Enter your password").fill("admin123")
        page.get_by_role("button", name="Sign in", exact=True).click()
        expect(page).to_have_url("http://localhost:5173/")

        # 2. Navigate to Product Management
        page.get_by_role("link", name="Products", exact=True).click()
        expect(page).to_have_url("http://localhost:5173/products")
        expect(page.get_by_role("heading", name="Products")).to_be_visible()

        # Wait for table to load
        expect(page.locator("table >> text=Loading...")).not_to_be_visible()

        # 3. Add a new product
        page.get_by_role("button", name="Add Product").click()

        modal = page.locator(".modal")
        expect(modal.get_by_role("heading", name="Add Product")).to_be_visible()

        modal.get_by_label("Name").fill("Test Product - Playwright")
        modal.get_by_label("Barcode").fill("PW-TEST-001")
        modal.get_by_label("Price").fill("15000")
        modal.get_by_label("Stock").fill("100")
        modal.get_by_label("Category").select_option(label="Stationery Lainnya")
        modal.get_by_label("Description").fill("This is a test product created by a Playwright script.")
        modal.get_by_role("button", name="Save").click()

        # 4. Verify the product was added
        expect(page.get_by_text("Product created successfully")).to_be_visible()
        expect(page.get_by_role("cell", name="Test Product - Playwright")).to_be_visible()

        # 5. Edit the product
        page.get_by_role("row", name=re.compile("Test Product - Playwright")).get_by_role("button", name="Edit").click()

        expect(modal.get_by_role("heading", name="Edit Product")).to_be_visible()
        modal.get_by_label("Name").fill("Test Product - Edited")
        modal.get_by_label("Price").fill("17500")
        modal.get_by_role("button", name="Save").click()

        # 6. Verify the product was edited
        expect(page.get_by_text("Product updated successfully")).to_be_visible()
        expect(page.get_by_role("cell", name="Test Product - Edited")).to_be_visible()

        # 7. Sort the product list
        product_header = page.get_by_role("cell", name=re.compile("Product Name"))
        product_header.click() # Sort ascending
        time.sleep(0.5)
        product_header.click() # Sort descending
        time.sleep(0.5)

        # 8. Delete the product
        page.on("dialog", lambda dialog: dialog.accept())
        page.get_by_role("row", name=re.compile("Test Product - Edited")).get_by_role("button", name="Delete").click()

        # 9. Verify the product was deleted
        expect(page.get_by_text("Product deleted successfully")).to_be_visible()
        expect(page.get_by_role("cell", name="Test Product - Edited")).not_to_be_visible()

        # 10. Screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        context.close()
        browser.close()

with sync_playwright() as p:
    run(p)
