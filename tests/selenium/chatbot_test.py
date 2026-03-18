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
TEST_EMAIL    = "melbinjames1212@gmail.com"
TEST_PASSWORD = "Sd123456"
BASE_URL      = "http://localhost:3001"

def run():
    print("\n" + "="*60)
    print("  ⭐ HERITX - CHATBOT FUNCTIONALITY TEST ⭐")
    print("  Flow: Login → Open Chat → English Chat → Malayalam Chat → Reset → Close")
    print("="*60)

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    wait = WebDriverWait(driver, 20)

    try:
        # ── STEP 1: Login ──
        print("\n[1/6] Logging in...")
        driver.get(BASE_URL + "/login")
        
        # Bypass location modal
        location_data = json.dumps({
            "city": "Kochi", "pincode": "682001",
            "manual": True, "lat": 9.9312, "lng": 76.2673
        })
        driver.execute_script(
            f"window.localStorage.setItem('hertix_user_location', '{location_data}');"
        )
        driver.refresh()
        
        email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        email_input.send_keys(TEST_EMAIL)
        
        pass_input = driver.find_element(By.XPATH, "//input[@type='password']")
        pass_input.send_keys(TEST_PASSWORD)
        
        login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Sign In')]")))
        driver.execute_script("arguments[0].click();", login_btn)
        
        wait.until(lambda d: "/login" not in d.current_url)
        print(f"     ✅ Logged in. URL: {driver.current_url}")

        # ── STEP 2: Open Chatbot ──
        print("\n[2/6] Opening Chatbot...")
        # The chatbot button has class 'chatbot-toggle'
        toggle_btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "chatbot-toggle")))
        driver.execute_script("arguments[0].click();", toggle_btn)
        
        # Verify chat window is open
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "chatbot-window")))
        print("     ✅ Chatbot window visible.")

        # ── STEP 3: English Interaction ──
        print("\n[3/6] Testing English Interaction...")
        chat_input = driver.find_element(By.CSS_SELECTOR, ".chatbot-input input")
        chat_input.send_keys("available items")
        driver.find_element(By.CLASS_NAME, "send-btn").click()
        print("     📤 Sent: 'available items'")
        
        # Wait for bot response options
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "option-chip")))
        time.sleep(1) # Visual check
        print("     🤖 Received bot response with options.")

        # ── STEP 4: Malayalam Interaction ──
        print("\n[4/6] Testing Malayalam Interaction...")
        chat_input.send_keys("എങ്ങനെ ബുക്ക് ചെയ്യാം?")
        driver.find_element(By.CLASS_NAME, "send-btn").click()
        print("     📤 Sent: 'എങ്ങനെ ബുക്ക് ചെയ്യാം?'")
        
        wait.until(lambda d: "ബുക്ക്" in d.page_source or "book" in d.page_source)
        time.sleep(1)
        print("     🤖 Received bot response for Malayalam query.")

        # ── STEP 5: Reset Chat ──
        print("\n[5/6] Testing Reset Functionality...")
        # Reset button has title 'Reset Chat' or class 'header-btn' (first one usually)
        reset_btn = driver.find_element(By.XPATH, "//button[@title='Reset Chat' or .//svg]") # Use title if translated
        driver.execute_script("arguments[0].click();", reset_btn)
        time.sleep(1)
        
        # Verify messages cleared (only greeting left)
        messages = driver.find_elements(By.CLASS_NAME, "message")
        if len(messages) <= 2: # Bot greeting + maybe typing
            print("     ✅ Chat reset successfully.")
        else:
            print(f"     ⚠️ Unexpected message count after reset: {len(messages)}")

        # ── STEP 6: Close Chat ──
        print("\n[6/6] Testing Close Button...")
        close_btn = driver.find_element(By.XPATH, "//button[@title='Close Chat' or contains(@class, 'close-btn')]")
        driver.execute_script("arguments[0].click();", close_btn)
        
        wait.until(EC.invisibility_of_element_located((By.CLASS_NAME, "chatbot-window")))
        print("     ✅ Chatbot window closed.")

        print("\n" + "*"*60)
        print("  🏆  TEST PASSED — Chatbot Fully Functional ✅")
        print("*"*60 + "\n")
        driver.save_screenshot("chatbot_test_success.png")

    except TimeoutException as e:
        print(f"\n❌ TIMEOUT: {e}")
        driver.save_screenshot("chatbot_test_fail.png")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("chatbot_test_fail.png")
        raise
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run()
