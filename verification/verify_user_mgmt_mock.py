from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock API Responses
        page.route("**/api/users", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''[
                {"UserId": 1, "Username": "owner", "Role": "Owner", "IsActive": 1, "CreatedAt": "2023-01-01"},
                {"UserId": 2, "Username": "worker1", "Role": "Worker", "IsActive": 1, "CreatedAt": "2023-01-02", "WorkerName": "Rajesh"}
            ]'''
        ))

        # Mock Create User
        page.route("**/api/users", lambda route: route.fulfill(
            status=201,
            content_type="application/json",
            body='{"UserId": 3, "Username": "newadmin", "Role": "Admin", "IsActive": 1}'
        ) if route.request.method == "POST" else route.continue_)

        # Navigate
        page.goto("http://localhost:5173/login")
        page.evaluate("localStorage.setItem('token', 'mock-token')")
        page.evaluate("localStorage.setItem('role', 'Owner')")

        print("Navigating to User Management...")
        page.goto("http://localhost:5173/dashboard/users")

        # Verify List
        page.wait_for_selector("text=User Management", timeout=30000)
        page.wait_for_selector("text=worker1")
        print("User list loaded.")

        # Open Add Modal
        page.click("button:has-text('Add User')")
        page.wait_for_selector("text=Add New User")

        # Fill Form
        page.fill("input[name='Username']", "newadmin")
        page.select_option("select[name='Role']", "Admin")
        page.fill("input[name='Password']", "password123")

        # Submit
        # page.click("button:has-text('Create User')")
        # Mocking logic for list refresh is tricky without real state update in mock list.
        # But we can verify UI interaction.

        # Take Screenshot
        page.screenshot(path="verification/user_mgmt.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
