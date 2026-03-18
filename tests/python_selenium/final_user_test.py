import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException

TEST_EMAIL    = "melbinjames1212@gmail.com"
TEST_PASSWORD = "Sd123456"
BASE_URL      = "http://localhost:3001"

def run():
    print("\n" + "="*55)
    print("  HERITX - USER LOGIN TEST")
    print("  Flow: Login → Dashboard → Logout")
    print("="*55)

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    wait = WebDriverWait(driver, 15)

    try:
        # ── STEP 1: Inject location into localStorage BEFORE login ──
        print("\n[1/4] Bypassing location modal...")
        driver.get(BASE_URL + "/login")
        time.sleep(1)
        location_data = json.dumps({
            "city": "Kochi", "pincode": "682001",
            "manual": True, "lat": 9.9312, "lng": 76.2673
        })
        driver.execute_script(
            f"window.localStorage.setItem('hertix_user_location', '{location_data}');"
        )
        driver.refresh()
        time.sleep(1.5)
        print("     ✅ Location injected — modal will not appear.")

        # ── STEP 2: Fill in login form ──
        print("\n[2/4] Logging in...")
        email_input = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//input[@type='email' or @placeholder[contains(.,'email') or contains(.,'Email')]]")
        ))
        email_input.clear()
        email_input.send_keys(TEST_EMAIL)

        pass_input = driver.find_element(
            By.XPATH, "//input[@type='password']"
        )
        pass_input.clear()
        pass_input.send_keys(TEST_PASSWORD)

        # Click Sign In
        login_btn = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Sign In') or contains(., 'Login') or contains(., 'Log in')]")
        ))
        driver.execute_script("arguments[0].click();", login_btn)
        print("     ✅ Credentials submitted.")

        # Wait for redirect away from /login
        wait.until(lambda d: "/login" not in d.current_url)
        print(f"     ✅ Redirected to: {driver.current_url}")

        # ── STEP 3: Navigate to Dashboard ──
        print("\n[3/4] Going to Dashboard...")
        driver.get(BASE_URL + "/dashboard")
        time.sleep(2)

        # Confirm dashboard loaded — look for the sidebar logout button
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, ".sidebar")
        ))
        print(f"     ✅ Dashboard loaded: {driver.current_url}")

        # ── STEP 4: Logout ──
        print("\n[4/4] Logging out...")
        logout_btn = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, ".nav-item.logout")
        ))
        driver.execute_script("arguments[0].click();", logout_btn)

        # Wait for redirect back to login or home
        wait.until(lambda d: "/dashboard" not in d.current_url)
        print(f"     ✅ Logged out. Redirected to: {driver.current_url}")

        print("\n" + "*"*55)
        print("  🏆  TEST PASSED — Login → Dashboard → Logout ✅")
        print("*"*55 + "\n")

    except TimeoutException as e:
        print(f"\n❌ TIMEOUT: {e}")
        driver.save_screenshot("tests/python_selenium/test_fail.png")
        print("   Screenshot saved → tests/python_selenium/test_fail.png")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("tests/python_selenium/test_fail.png")
        print("   Screenshot saved → tests/python_selenium/test_fail.png")
        raise
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run()
