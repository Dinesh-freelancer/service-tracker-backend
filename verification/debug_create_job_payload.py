from playwright.sync_api import sync_playwright, expect
import json

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

    # Mocks
    page.route("**/auth/login", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"token": "fake", "Role": "Admin", "UserId": 1}'
    ))
    page.route("**/api/customers?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"data": [{"CustomerId": 1, "CustomerName": "John Doe", "PrimaryContact": "9876543210"}]}'
    ))
    page.route("**/api/assets?customerId=1", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='[]'
    ))

    def handle_jobs(route):
        print(f"POST /api/jobs Payload: {route.request.post_data}")
        route.fulfill(status=201, body='{"JobNumber": "123"}')

    page.route("**/api/jobs", handle_jobs)

    # Login
    page.goto("http://localhost:5173/login")
    page.fill('input[name="username"]', "admin")
    page.fill('input[name="password"]', "password")
    page.click('button[type="submit"]')
    page.wait_for_timeout(1000)

    # Go to Create Job
    page.goto("http://localhost:5173/dashboard/jobs/new")

    # Step 1
    page.fill('input[placeholder*="Search"]', "John")
    page.wait_for_timeout(1000)
    page.click('text=John Doe')

    # Step 2
    page.select_option('select', 'NEW')
    page.fill('input[name="Brand"]', "TestBrand")
    page.fill('input[name="PumpModel"]', "P1")
    page.click('text=Next: Job Details')

    # Step 3
    page.fill('textarea[name="Notes"]', "Test Note")
    page.click('button:has-text("Create Job")')

    page.wait_for_timeout(2000)
    browser.close()

with sync_playwright() as p:
    run(p)
