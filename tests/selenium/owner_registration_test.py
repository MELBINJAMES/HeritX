import time
import random
import string
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException

# ── Config ──────────────────────────────────────────────
ADMIN_URL    = "http://localhost:3002"
ADMIN_EMAIL  = "admin@heritx.com"
ADMIN_PASS   = "admin123"

# New owner — unique email each run
rand_id      = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
SHOP_NAME    = f"Heritage Shop {rand_id}"
OWNER_EMAIL  = f"owner_{rand_id}@gmail.com"
OWNER_PASS   = "TestOwner@1"

SHOP_ADDRESS = "45 Fort Kochi Lane"
SHOP_CITY    = "Cochin"
SHOP_PINCODE = "682001"
SHOP_PHONE   = "9876543210"

PROOF_FILE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_proof.txt")

# Create dummy proof file if not exists
if not os.path.exists(PROOF_FILE):
    with open(PROOF_FILE, "w") as f:
        f.write("HeritX Test Document Content")

# ────────────────────────────────────────────────────────

def make_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--js-flags=--max-old-space-size=4096")
    options.add_argument("--disable-extensions")
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

def click_element_with_retry(driver, by, value, timeout=15):
    """Helper to click an element, retrying if stale."""
    wait = WebDriverWait(driver, timeout)
    end_time = time.time() + timeout
    while time.time() < end_time:
        try:
            element = wait.until(EC.element_to_be_clickable((by, value)))
            driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", element)
            return True
        except StaleElementReferenceException:
            continue
        except Exception as e:
            print(f"      [Retry Click Failed] {e}")
            time.sleep(1)
    return False

def run():
    print("\n" + "="*70)
    print("  ⭐ HERITX - OWNER REGISTRATION COMPREHENSIVE TEST ⭐")
    print("  Flow: Register -> Admin Approve -> Owner Login -> Dashboard -> Logout")
    print("="*70)
    print(f"\n  [Setup] Shop: {SHOP_NAME}")
    print(f"  [Setup] Owner: {OWNER_EMAIL}")
    print(f"  [Setup] Admin: {ADMIN_EMAIL}")

    driver = make_driver()
    wait = WebDriverWait(driver, 25)

    try:
        # ─────────────────────────────────────────────────────────
        # PHASE 1: Register as a new Shop Owner
        # ─────────────────────────────────────────────────────────
        print("\n" + "─"*70)
        print("[PHASE 1/4] Registering new Shop Owner...")
        print("─"*70)

        driver.get(ADMIN_URL + "/register/owner")
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='HeritX Boutique']")))
        print(f"  ✅ Registration page landed")

        driver.find_element(By.XPATH, "//input[@placeholder='HeritX Boutique']").send_keys(SHOP_NAME)
        driver.find_element(By.ID, "email-input").send_keys(OWNER_EMAIL)
        driver.find_element(By.ID, "password-input").send_keys(OWNER_PASS)
        driver.find_element(By.XPATH, "//input[@placeholder='Verify Password']").send_keys(OWNER_PASS)
        driver.find_element(By.XPATH, "//input[@placeholder='Building No, Street Name, Area']").send_keys(SHOP_ADDRESS)
        driver.find_element(By.XPATH, "//input[@placeholder='e.g. Cochin']").send_keys(SHOP_CITY)
        driver.find_element(By.XPATH, "//input[@placeholder='682001']").send_keys(SHOP_PINCODE)

        phone_inputs = driver.find_elements(By.XPATH, "//input[@placeholder='+91 98765 43210']")
        phone_inputs[-1].send_keys(SHOP_PHONE)

        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        driver.execute_script("arguments[0].style.opacity='1'; arguments[0].style.position='relative';", file_input)
        file_input.send_keys(PROOF_FILE)

        submit_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']")))
        driver.execute_script("arguments[0].click();", submit_btn)

        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Request Received') or contains(text(),'Account created')]")
        ))
        print("  ✅ Registration submitted successfully (Pending Approval state)")
        time.sleep(2)

        # ─────────────────────────────────────────────────────────
        # PHASE 2: Login as Admin → Approve the Shop
        # ─────────────────────────────────────────────────────────
        print("\n" + "─"*70)
        print("[PHASE 2/4] Admin Approval Flow...")
        print("─"*70)

        driver.get(ADMIN_URL + "/shop-owner/login")
        
        email_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        email_field.clear()
        email_field.send_keys(ADMIN_EMAIL)
        
        pass_field = driver.find_element(By.XPATH, "//input[@type='password']")
        pass_field.clear()
        pass_field.send_keys(ADMIN_PASS)
        
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(.,'Verify Shops')]")))
        print("  ✅ Admin logged in successfully")

        # Click the "Verify Shops" tab
        click_element_with_retry(driver, By.XPATH, "//button[contains(., 'Verify Shops')]")
        time.sleep(2)
        print("  ✅ Navigated to Pending Shops table")

        # Find our shop owner in the table and click 'Verify Details'
        verify_details_xpath = f"//td[normalize-space()='{OWNER_EMAIL}']/following-sibling::td//button[contains(.,'Verify Details')]"
        if not click_element_with_retry(driver, By.XPATH, verify_details_xpath):
            raise Exception(f"Could not find or click 'Verify Details' for {OWNER_EMAIL}")
        
        print(f"  ✅ Details modal opened for {OWNER_EMAIL}")
        time.sleep(1.5)

        # Click 'Approve & Activate'
        approve_xpath = "//button[contains(., 'Approve') and contains(., 'Activate')]"
        if not click_element_with_retry(driver, By.XPATH, approve_xpath):
            raise Exception("Could not find or click 'Approve & Activate' button")
        
        # Wait for success toast
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Action completed successfully')]")))
        print("  ✅ Shop approved successfully!")
        time.sleep(2)

        # Sign out from Admin
        print("  🔄 Signing out from Admin...")
        sign_out_admin_xpath = "//button[contains(text(), 'Sign Out') or contains(@class, 'logout-btn') or contains(text(), 'Sign out')]"
        if not click_element_with_retry(driver, By.XPATH, sign_out_admin_xpath):
             # Fallback sidebar scan
             driver.find_element(By.XPATH, "//aside//button[contains(., 'Sign Out')]").click()
        
        time.sleep(2)
        print("  ✅ Admin logout complete")

        # ─────────────────────────────────────────────────────────
        # PHASE 3: Login as Shop Owner
        # ─────────────────────────────────────────────────────────
        print("\n" + "─"*70)
        print("[PHASE 3/4] Testing Shop Owner Login...")
        print("─"*70)

        driver.get(ADMIN_URL + "/shop-owner/login")
        time.sleep(1)
        
        email_owner = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        email_owner.clear()
        email_owner.send_keys(OWNER_EMAIL)
        
        pass_owner = driver.find_element(By.XPATH, "//input[@type='password']")
        pass_owner.clear()
        pass_owner.send_keys(OWNER_PASS)
        
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        print(f"  ✅ Login credentials submitted for {OWNER_EMAIL}")

        # Wait for redirect to dashboard
        wait.until(lambda d: "dashboard" in d.current_url.lower())
        print(f"  ✅ Owner dashboard reached: {driver.current_url}")
        
        # Give some time for dashboard assets to load
        time.sleep(10)
        driver.save_screenshot("test_owner_final_dashboard.png")

        # ─────────────────────────────────────────────────────────
        # PHASE 4: Sign Out and Finalize
        # ─────────────────────────────────────────────────────────
        print("\n" + "─"*70)
        print("[PHASE 4/4] Verifying Dashboard & Sign Out...")
        print("─"*70)

        # Look for 'Sign Out' button in the dashboard
        # Based on ShopOwnerDashboard.tsx, it's a button with text 'Sign Out'
        sign_out_owner_xpath = "//button[normalize-space()='Sign Out' or contains(text(), 'Sign out')]"
        
        if click_element_with_retry(driver, By.XPATH, sign_out_owner_xpath):
            print("  ✅ Clicked Owner Sign Out button successfully")
        else:
            print("  ⚠️ Sign Out button not clickable via XPATH, attempting direct click...")
            driver.find_element(By.XPATH, sign_out_owner_xpath).click()

        # Wait for the URL to change back to login or user app
        wait.until(lambda d: "dashboard" not in d.current_url.lower())
        print(f"  ✅ Final Logout confirmed. Current URL: {driver.current_url}")

        print("\n" + "🏆" + "═"*68 + "🏆")
        print("  CONGRATULATIONS! ALL PHASES PASSED SUCCESSFULLY.")
        print("  1. Registration -> OK")
        print("  2. Admin Approval -> OK")
        print("  3. Owner Login -> OK")
        print("  4. Final Logout -> OK")
        print("═"*70)

    except TimeoutException as e:
        print("\n" + "!"*70)
        print(f"  ❌ TIMEOUT ERROR: Element not found or ready in time.")
        print(f"     Details: {e}")
        driver.save_screenshot("test_error_timeout.png")
        print(f"  📸 Screenshot saved: test_error_timeout.png")
        print(f"     Current URL: {driver.current_url}")
        print("!"*70)
        raise
    except Exception as e:
        print("\n" + "!"*70)
        print(f"  ❌ UNEXPECTED ERROR: {e}")
        driver.save_screenshot("test_error_general.png")
        print(f"  📸 Screenshot saved: test_error_general.png")
        print("!"*70)
        raise
    finally:
        time.sleep(3)
        driver.quit()

if __name__ == "__main__":
    run()
