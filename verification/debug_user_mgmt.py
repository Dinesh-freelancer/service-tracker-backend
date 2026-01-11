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

        page.goto("http://localhost:5173/login")
        page.evaluate("localStorage.setItem('token', 'mock-token')")
        page.evaluate("localStorage.setItem('role', 'Owner')")

        print("Navigating to User Management...")
        page.goto("http://localhost:5173/dashboard/users")

        # Take Screenshot immediately to see what's happening
        page.wait_for_timeout(2000) # Wait 2s for render
        page.screenshot(path="verification/user_mgmt_debug.png")
        print("Debug Screenshot saved.")

        # Try to find list
        try:
            page.wait_for_selector("text=worker1", timeout=5000)
            print("Found worker1")
        except:
            print("Did not find worker1")

        browser.close()

if __name__ == "__main__":
    run()
