from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock API Responses
        page.route("**/api/jobs/JOB123", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='''{
                "JobNumber": "JOB123",
                "Status": "Intake",
                "DateReceived": "2023-10-10",
                "InternalTag": "TAG-123",
                "Brand": "TestPump",
                "AssetType": "Pumpset",
                "PumpModel": "P1",
                "MotorModel": "M1",
                "CustomerName": "Test Customer",
                "PrimaryContact": "9999999999",
                "Notes": "Test Notes",
                "Parts": [
                    {"PartUsedId": 1, "PartName": "Bearing", "Qty": 2, "CostPrice": 100}
                ],
                "History": [
                    {"HistoryId": 1, "StatusFrom": "New", "StatusTo": "Intake", "ChangedAt": "2023-10-10T10:00:00Z", "ChangeComments": "Created"}
                ],
                "Documents": []
            }'''
        ))

        # Mock Inventory for Add Part
        page.route("**/api/inventory*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"data": [{"PartId": 1, "PartName": "Bearing", "QuantityInStock": 10, "DefaultCostPrice": 50}]}'
        ))

        # Navigate
        # Inject Token
        page.goto("http://localhost:5173/login")
        page.evaluate("localStorage.setItem('token', 'mock-token')")
        page.evaluate("localStorage.setItem('role', 'Owner')")

        print("Navigating to Job Details...")
        page.goto("http://localhost:5173/dashboard/jobs/JOB123")

        # Wait for Job Details to load
        page.wait_for_selector("text=Job #JOB123", timeout=30000)
        print("Job Details Loaded.")

        # Open Status Modal to verify UI
        page.click("button:has-text('Update Status')")
        page.wait_for_selector("text=Update Job Status")

        # Take Screenshot
        page.screenshot(path="verification/job_details_modal.png")
        print("Screenshot saved.")

        # Close Modal
        page.click("button:has-text('Cancel')")

        # Open Parts Tab
        page.click("button:has-text('Parts Used')")
        page.wait_for_selector("text=Bearing")

        # Take Screenshot of Parts
        page.screenshot(path="verification/job_details_parts.png")
        print("Screenshot Parts saved.")

        browser.close()

if __name__ == "__main__":
    run()
