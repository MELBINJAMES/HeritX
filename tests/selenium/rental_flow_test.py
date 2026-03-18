import time
import json
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException

# ── Config ──────────────────────────────────────────────
TEST_EMAIL    = "melbinjames1212@gmail.com"
TEST_PASSWORD = "Sd123456"
BASE_URL      = "http://localhost:3001"

def set_react_input(driver, element, value):
    """Sets value of a React input using _valueTracker bypass."""
    driver.execute_script("""
        var el = arguments[0], val = arguments[1], last = el.value;
        el.value = val;
        var tracker = el._valueTracker;
        if (tracker) tracker.setValue(last);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    """, element, value)

def type_date(driver, element, date_str):
    """Type a date into a date input using keyboard (dd-mm-yyyy format for Chrome)."""
    element.click()
    time.sleep(0.3)
    # Chrome date inputs accept dd-mm-yyyy via keyboard
    # Parse YYYY-MM-DD into dd, mm, yyyy
    parts = date_str.split("-")
    dd = parts[2]
    mm = parts[1]
    yyyy = parts[0]
    # Clear existing value
    element.send_keys(Keys.CONTROL + "a")
    time.sleep(0.1)
    # Type in dd-mm-yyyy order (Chrome Tab-navigates between fields)
    element.send_keys(dd)
    element.send_keys(Keys.TAB)
    time.sleep(0.1)
    element.send_keys(mm)
    element.send_keys(Keys.TAB)
    time.sleep(0.1)
    element.send_keys(yyyy)
    time.sleep(0.3)

def run():
    print("\n" + "="*60)
    print("  📦 HERITX - RENTAL & PAYMENT FLOW TEST 📦")
    print("  Flow: Login → Browse → Item → Rent Now → Checkout → Completion")
    print("="*60)

    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    wait = WebDriverWait(driver, 35)

    try:
        # ── STEP 1: Login ──
        print("\n[1/5] Logging in & Bypassing location...")
        driver.get(BASE_URL + "/login")
        location_data = json.dumps({
            "city": "Kochi", "pincode": "682001",
            "manual": True, "lat": 9.9312, "lng": 76.2673
        })
        driver.execute_script(f"window.localStorage.setItem('hertix_user_location', '{location_data}');")
        driver.refresh()
        
        email_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        email_input.send_keys(TEST_EMAIL)
        pass_input = driver.find_element(By.XPATH, "//input[@type='password']")
        pass_input.send_keys(TEST_PASSWORD)
        
        login_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Sign In')]")))
        login_btn.click()
        wait.until(lambda d: "/login" not in d.current_url)
        print(f"     ✅ Logged in. URL: {driver.current_url}")

        # ── STEP 2: Browse & Select Item ──
        print("\n[2/5] Browsing Items...")
        driver.get(BASE_URL + "/browse")
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "item-card")))
        time.sleep(2)
        
        # Click the first View link
        view_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(@class, 'item-card')]//a[contains(., 'View') or contains(., 'കാണുക')]")))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", view_link)
        time.sleep(0.5)
        view_link.click()
        
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1")))
        item_name = driver.find_element(By.TAG_NAME, 'h1').text
        print(f"     ✅ Item selected: {item_name}")

        # ── STEP 3: Click Rent Now ──
        print("\n[3/5] Initiating 'Rent Now'...")
        rent_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Rent Now')]")))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", rent_btn)
        time.sleep(0.5)
        rent_btn.click()
        
        wait.until(lambda d: "/checkout" in d.current_url)
        print("     ✅ Redirected to Checkout.")

        # ── STEP 4: Fill Checkout Form ──
        print("\n[4/5] Filling Checkout details...")
        
        # Dates: 7 days from now, 3-day rental
        start_date_obj = datetime.now() + timedelta(days=7)
        end_date_obj = start_date_obj + timedelta(days=2)
        start_date_str = start_date_obj.strftime("%Y-%m-%d")
        end_date_str = end_date_obj.strftime("%Y-%m-%d")
        
        # Set dates using React valueTracker bypass
        start_input = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//input[@type='date'][preceding-sibling::label[contains(., 'Start')]]")))
        end_input = driver.find_element(By.XPATH, 
            "//input[@type='date'][preceding-sibling::label[contains(., 'End')]]")
        
        set_react_input(driver, start_input, start_date_str)
        time.sleep(0.5)
        set_react_input(driver, end_input, end_date_str)
        time.sleep(1)
        
        # Verify duration shows up
        try:
            duration_el = wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Duration') or contains(text(), 'Days')]")))
            print(f"     📅 Dates set: {start_date_str} to {end_date_str} - {duration_el.text}")
        except:
            print(f"     📅 Dates set: {start_date_str} to {end_date_str}")
        
        # Phone
        phone_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='tel']")))
        set_react_input(driver, phone_input, "9876543210")
        print("     📱 Phone set: 9876543210")
        
        # Payment Method: Pay on Pickup - must reliably select the COD radio
        # The default is 'online', so we MUST switch to 'cod'
        cod_radio = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//input[@type='radio'][@value='cod']")))
        
        # Use JS to directly set the radio as checked and trigger React onChange
        driver.execute_script("""
            var radio = arguments[0];
            radio.checked = true;
            var tracker = radio._valueTracker;
            if (tracker) tracker.setValue('online');
            radio.dispatchEvent(new Event('click', { bubbles: true }));
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        """, cod_radio)
        time.sleep(0.5)
        
        # Also click the parent label for extra safety
        try:
            pay_pickup_label = driver.find_element(By.XPATH, "//label[.//input[@value='cod']]")
            pay_pickup_label.click()
            time.sleep(0.5)
        except: pass
        
        # Verify it's selected
        is_cod_selected = driver.execute_script("return document.querySelector('input[value=\"cod\"]').checked;")
        print(f"     💳 Payment Method: Pay on Pickup (cod checked={is_cod_selected})")

        time.sleep(2)
        driver.save_screenshot("rental_flow_checkout_ready.png")

        # ── STEP 5: Complete Order ──
        print("\n[5/5] Completing Order...")
        
        # Find the submit button
        submit_btn = wait.until(EC.presence_of_element_located(
            (By.XPATH, "//button[contains(., 'Proceed to Order')]")))
        
        # Check if disabled
        is_disabled = submit_btn.get_attribute("disabled")
        print(f"     📊 Button disabled={is_disabled}")
        
        if is_disabled:
            # Duration might not have been captured - force dates again
            print("     ⚠️  Button disabled - re-setting dates via keyboard...")
            start_input = driver.find_element(By.XPATH, 
                "//input[@type='date'][preceding-sibling::label[contains(., 'Start')]]")
            type_date(driver, start_input, start_date_str)
            time.sleep(1)
            end_input = driver.find_element(By.XPATH, 
                "//input[@type='date'][preceding-sibling::label[contains(., 'End')]]")
            type_date(driver, end_input, end_date_str)
            time.sleep(2)
            
            # Re-find submit
            submit_btn = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(., 'Proceed to Order')]")))
        
        # Scroll and click
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        time.sleep(1)
        
        # Try native click first, then fall back to ActionChains
        try:
            submit_btn.click()
        except:
            ActionChains(driver).move_to_element(submit_btn).click().perform()
        
        print("     👆 Submit clicked.")
        
        # Wait for redirect
        wait.until(lambda d: "/payment-success" in d.current_url)
        print(f"     ✅ Order Confirmed! URL: {driver.current_url}")
        
        # Check for confirmation text
        success_msg = wait.until(EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(text(), 'Order Confirmed') or contains(text(), 'Confirmed')]")))
        print(f"     ✅ UI Feedback: {success_msg.text}")

        print("\n" + "*"*60)
        print("  🏆  TEST PASSED — Rental Flow Complete ✅")
        print("*"*60 + "\n")
        driver.save_screenshot("rental_flow_success.png")

    except TimeoutException as e:
        print(f"\n❌ TIMEOUT: {e}")
        driver.save_screenshot("rental_flow_fail.png")
        with open("rental_flow_debug.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        driver.save_screenshot("rental_flow_fail.png")
        raise
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    run()
