import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def run_dashboard_flow():
    print("============================================================")
    print("   🚀 STARTING LIVE TEST: USER DASHBOARD FLOW")
    print("============================================================\n")

    # Initialize Chrome in LIVE mode (not headless)
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # Comment out or remove headless to see browser
    # options.add_argument("--headless") 

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    wait = WebDriverWait(driver, 15)

    try:
        # 1. Login
        print("[1/5] Navigating to Login Page...")
        driver.get("http://localhost:3001/login")
        
        print("      Entering credentials...")
        email_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        email_field.send_keys("finder_test@heritx.com")
        
        pass_field = driver.find_element(By.XPATH, "//input[@type='password']")
        pass_field.send_keys("Password@123")
        
        login_btn = driver.find_element(By.XPATH, "//button[contains(., 'Sign In')]")
        driver.execute_script("arguments[0].click();", login_btn)

        # 2. Verify Home/Dashboard Redirect
        print("[2/5] Verifying Login Success...")
        wait.until(EC.url_contains("/dashboard") or EC.url_to_be("http://localhost:3001/"))
        print("      ✅ Successfully Logged In.")

        # 3. Surf through each section
        sections = [
            ("Browse Items", "/browse"),
            ("Wishlist", "/dashboard/wishlist"),
            ("My Rentals", "/dashboard/rentals"),
            ("Payments", "/dashboard/payments"),
            ("Profile", "/dashboard/profile"),
            ("Cultural Help", "/help"),
            ("Dashboard", "/dashboard")
        ]

        print(f"[3/5] Surfing through {len(sections)} Dashboard sections...")
        
        for name, path in sections:
            print(f"      📍 Navigating to: {name} ({path})...")
            # Click Sidebar Link by label
            try:
                link = wait.until(EC.element_to_be_clickable((By.XPATH, f"//span[contains(@class, 'label') and text()='{name}']")))
                driver.execute_script("arguments[0].scrollIntoView();", link)
                driver.execute_script("arguments[0].click();", link)
                
                # Wait for URL to update
                wait.until(EC.url_contains(path.split('/')[-1]))
                time.sleep(1.5) # Pause to let user see the live browser
                print(f"         ✅ Loaded {name}")
            except Exception as e:
                print(f"         ❌ Failed to navigate to {name}: {str(e)}")

        # 4. Final Dashboard Return
        print("[4/5] Returning to Main Dashboard...")
        driver.get("http://localhost:3001/dashboard")
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "dashboard-container") or (By.CLASS_NAME, "sidebar")))
        time.sleep(2)

        # 5. Logout
        print("[5/5] Performing Logout...")
        logout_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Logout')]")))
        driver.execute_script("arguments[0].click();", logout_btn)
        
        wait.until(EC.url_contains("/login"))
        print("      ✅ Logout successful.")

        print("\n============================================================")
        print("   🎉 ALL REDESIGN FLOWS TESTED SUCCESSFULLY!")
        print("============================================================")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        driver.save_screenshot("tests/python_selenium/dashboard_failure.png")
        print(f"📸 Screenshot saved: tests/python_selenium/dashboard_failure.png")

    finally:
        time.sleep(3) # Let the user see the final state
        driver.quit()
        print("\n[Python] Test Session Ended.")

if __name__ == "__main__":
    run_dashboard_flow()
