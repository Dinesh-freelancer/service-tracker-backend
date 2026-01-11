import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to Login...")
        try:
            page.goto("http://localhost:5173/login", timeout=60000)
        except Exception as e:
            print(f"Error navigating to login: {e}")
            return

        # Login
        try:
            print("Waiting for username input...")
            page.wait_for_selector("#username", state="visible", timeout=30000)
            page.fill("#username", "owner")
            page.fill("#password", "password123")
            page.click("button[type='submit']")

            # Wait for dashboard
            page.wait_for_url("**/dashboard")
            print("Logged in successfully.")
        except Exception as e:
            print(f"Login failed: {e}")
            # print(page.content())
            return

        # Create Job
        print("Navigating to Create Job...")
        page.goto("http://localhost:5173/dashboard/jobs/new")

        # Step 1: Customer
        # Wait for customer list
        print("Selecting Customer...")
        page.wait_for_selector("text=Alpha Industries", timeout=30000)
        page.click("text=Alpha Industries")

        # Step 2: Asset (New)
        print("Creating New Asset...")
        page.select_option("select", "NEW")
        # Wait for New Asset form
        page.wait_for_selector("input[name='Brand']")

        page.fill("input[name='Brand']", "TestPump")
        page.fill("input[name='PumpModel']", "X100")
        page.click("text=Next: Job Details")

        # Step 3: Job Details
        print("Filling Job Details...")
        page.fill("textarea[name='Notes']", "Testing Workflow")
        page.click("button:has-text('Create Job')")

        # Wait for redirection to Jobs List
        page.wait_for_url("**/dashboard/jobs")
        print("Job created, redirected to list.")

        # Open the new job (First one in the list)
        # Assuming the list is ordered by date desc
        time.sleep(2) # Wait for list to refresh
        print("Opening Job...")
        page.wait_for_selector("table tbody tr:first-child")
        page.click("table tbody tr:first-child")

        # Wait for Job Details
        page.wait_for_url("**/dashboard/jobs/JOB-*")
        job_url = page.url
        print(f"Opened Job Details: {job_url}")

        # --- Test Parts ---
        print("Testing Parts...")
        page.click("button:has-text('Parts Used')")
        page.click("button:has-text('Add Part')")

        # Search Part
        print("Searching Part...")
        page.fill("input[placeholder='Type part name...']", "Bearing")
        # Wait for result
        page.wait_for_selector("text=Ball Bearing 6204", timeout=10000)
        page.click("text=Ball Bearing 6204")

        # Add
        print("Adding Part...")
        page.click("button:has-text('Add Part')")

        # Verify
        print("Verifying Part...")
        page.wait_for_selector("text=Ball Bearing 6204")
        page.wait_for_selector("text=Part added to job") # Toast
        print("Part added successfully.")

        # --- Test Status Update ---
        print("Testing Status Update...")
        page.click("button:has-text('Update Status')")

        # Status Select (First select in modal)
        # We need to be careful with selectors.
        # Use label association if possible? No simple label association in playwright without ID.
        # But we know structure.
        print("Selecting Status...")
        page.select_option("select >> nth=0", "Completed")

        # Resolution Type
        print("Selecting Resolution...")
        page.wait_for_selector("text=Resolution Type")
        page.select_option("select >> nth=1", "Completed Successfully")

        page.click("button:has-text('Update Status')")

        # Verify
        print("Verifying Status...")
        page.wait_for_selector("span:has-text('Completed')")
        print("Status updated to Completed.")

        # --- Test Audit Log ---
        print("Testing Audit Log...")
        page.click("button:has-text('Audit Log')")
        page.wait_for_selector("text=Status updated from", timeout=10000)
        print("Audit log verified.")

        print("ALL TESTS PASSED")
        browser.close()

if __name__ == "__main__":
    run()
