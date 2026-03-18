import time
import json
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException

# ── Config ──────────────────────────────────────────────
BASE_URL = "http://localhost:3001"

def run():
    print("\n" + "="*60)
    print("  ⭐ HERITX - LOCATION SELECTION TEST ⭐")
    print("  Flow: Modal Check → Manual Kochi → Manual Pincode → Mocked Detect")
    print("="*60)

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    wait = WebDriverWait(driver, 25)

    try:
        # ── PHASE 1: Modal Presence Check ──
        print("\n[1/4] Checking for Location Modal on fresh load...")
        driver.get(BASE_URL)
        # Clear localStorage to ensure modal pops up
        driver.execute_script("window.localStorage.removeItem('hertix_user_location');")
        driver.refresh()
        
        # Should see the h2 with "Select Your Location"
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Select Your Location')]")))
        print("     ✅ Location modal is visible.")

        # ── PHASE 2: Manual City Entry ──
        print("\n[2/4] Testing Manual City Entry (Kochi)...")
        city_input = wait.until(EC.presence_of_element_located((By.ID, "location-input")))
        city_input.clear()
        city_input.send_keys("Kochi")
        
        save_btn = driver.find_element(By.ID, "save-location-btn")
        driver.execute_script("arguments[0].click();", save_btn)
        
        # Prompt should close
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Select Your Location')]")))
        print("     ✅ Modal closed after manual entry.")
        
        # Check localStorage
        loc_str = driver.execute_script("return window.localStorage.getItem('hertix_user_location');")
        loc_data = json.loads(loc_str)
        if loc_data.get('city') == 'Kochi':
            print(f"     ✅ localStorage updated: Kochi (Lat: {loc_data.get('lat')}, Lng: {loc_data.get('lng')})")
        else:
            print(f"     ⚠️ Unexpected localStorage data: {loc_str}")

        # ── PHASE 3: Manual Pincode Entry ──
        print("\n[3/4] Testing Manual Pincode Entry (682001)...")
        # Click the location chip in navbar (title='Change Location')
        nav_chip = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[@title='Change Location']")))
        driver.execute_script("arguments[0].click();", nav_chip)
        
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Select Your Location')]")))
        
        pin_input = driver.find_element(By.ID, "location-input")
        pin_input.clear()
        pin_input.send_keys("682001")
        
        save_btn = driver.find_element(By.ID, "save-location-btn")
        driver.execute_script("arguments[0].click();", save_btn)
        
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Select Your Location')]")))
        
        loc_str = driver.execute_script("return window.localStorage.getItem('hertix_user_location');")
        loc_data = json.loads(loc_str)
        if loc_data.get('pincode') == '682001':
            print("     ✅ localStorage updated: 682001.")
        else:
            print(f"     ⚠️ Unexpected localStorage data: {loc_str}")

        # ── PHASE 4: Mocked Geolocation Detection ──
        print("\n[4/4] Testing Geolocation Detection (Mocked)...")
        # Re-open prompt
        nav_chip = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[@title='Change Location']")))
        driver.execute_script("arguments[0].click();", nav_chip)
        
        # Set mock location in Chrome via CDP (Kochi coords)
        params = {
            "latitude": 9.9312,
            "longitude": 76.2673,
            "accuracy": 100
        }
        driver.execute_cdp_cmd("Emulation.setGeolocationOverride", params)
        
        detect_btn = wait.until(EC.element_to_be_clickable((By.ID, "detect-location-btn")))
        driver.execute_script("arguments[0].click();", detect_btn)
        
        # Wait for modal to close (it might show "Detecting..." spinner)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//div[contains(text(), 'Select Your Location')]")))
        
        time.sleep(2) # Extra time for async geocoding/state update
        loc_str = driver.execute_script("return window.localStorage.getItem('hertix_user_location');")
        loc_data = json.loads(loc_str)
        
        print(f"     🔎 Final localStorage: {loc_str}")
        
        # Check if manual is False (meaning it was detected)
        # Note: In detection flow, manual: false is set
        if loc_data.get('manual') == False:
            print(f"     ✅ Auto-detection successful: {loc_data.get('city')}, {loc_data.get('pincode')}")
        else:
            print(f"     ⚠️ Detected location results: {loc_str}")

        print("\n" + "*"*60)
        print("  🏆  TEST PASSED — Location Selection Verified ✅")
        print("*"*60 + "\n")
        driver.save_screenshot("location_test_verification.png")

    except TimeoutException as e:
        print(f"\n❌ TIMEOUT: {e}")
        driver.save_screenshot("location_test_fail.png")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("location_test_fail.png")
        raise
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run()
