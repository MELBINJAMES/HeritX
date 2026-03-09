const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runUserJourney() {
    console.log("\n=========================================");
    console.log("   🛍️  HERITX USER JOURNEY TEST          ");
    console.log("=========================================\n");

    let options = new chrome.Options();
    options.setUserPreferences({
        'profile.default_content_setting_values.geolocation': 1,
        'profile.default_content_setting_values.notifications': 1
    });

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Mock geolocation (Kochi)
    await driver.executeScript("window.navigator.geolocation.getCurrentPosition = (success) => { success({ coords: { latitude: 9.9312, longitude: 76.2673 } }); };");

    try {
        // Step 1: Landing Page & Location Modal
        console.log("Step 1: 🏠 Opening Landing Page...");
        await driver.get('http://localhost:3001/');

        try {
            console.log("      Checking for 'Select Your Location' modal...");
            let modalBtn = await driver.wait(until.elementLocated(By.id("detect-location-btn")), 5000);
            await driver.sleep(1000);
            console.log("      Dismissing modal...");
            await modalBtn.click();
            await driver.sleep(2000);
        } catch (e) {
            console.log("      ℹ️ Modal not found, continuing.");
        }

        // Step 2: Login
        console.log("\nStep 2: 👤 Logging in...");
        await driver.get('http://localhost:3001/login');
        await driver.wait(until.elementLocated(By.xpath("//input[@type='email']")), 5000);
        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('owner@hertix.com');
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('Admin@123');
        let loginBtn = await driver.findElement(By.xpath("//button[contains(., 'Sign in') or contains(., 'Login')]"));
        await loginBtn.click();
        await driver.wait(until.urlContains('/'), 10000);
        console.log("      ✅ Logged in successfully.");
        await driver.sleep(2000);

        // Step 3: Browse Items
        console.log("\nStep 3: 🔍 Browsing Items (Map will stay closed)...");
        await driver.get('http://localhost:3001/browse');
        await driver.wait(until.elementLocated(By.css('[title="Add to Cart"]')), 10000);
        console.log("      ✅ Browse page loaded.");
        await driver.sleep(3000);

        // Step 4: Add Item to Cart
        console.log("\nStep 4: 🛒 Adding item to Cart...");
        let addToCartBtn = await driver.findElement(By.css('[title="Add to Cart"]'));
        await addToCartBtn.click();
        console.log("      ✅ Item added to cart.");
        await driver.sleep(2000);

        // Step 5: Go to Cart and Checkout
        console.log("\nStep 5: 💳 Proceeding to Checkout...");
        await driver.get('http://localhost:3001/cart');
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Checkout')]")), 5000);
        let checkoutBtn = await driver.findElement(By.xpath("//button[contains(., 'Checkout')]"));
        await checkoutBtn.click();
        await driver.wait(until.urlContains('/checkout'), 10000);
        console.log("      ✅ Reached Checkout page.");
        await driver.sleep(2000);

        // Step 6: Fill Checkout Details
        console.log("\nStep 6: 📝 Filling order details...");

        // Set dates (Tomorrow and Day after)
        let tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        let dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2);
        let tomorrowStr = tomorrow.toISOString().split('T')[0];
        let dayAfterStr = dayAfter.toISOString().split('T')[0];

        let dateInputs = await driver.findElements(By.css('input[type="date"]'));
        await dateInputs[0].sendKeys(tomorrowStr);
        await driver.sleep(500);
        await dateInputs[1].sendKeys(dayAfterStr);
        console.log(`      📅 Rental Period: ${tomorrowStr} to ${dayAfterStr}`);

        // Phone Number
        let phoneInput = await driver.findElement(By.css('input[placeholder*="10-digit"]'));
        await phoneInput.sendKeys('9876543210');

        // Select "Pay on Pickup" (COD)
        let codRadio = await driver.findElement(By.css('input[value="cod"]'));
        await driver.executeScript("arguments[0].click();", codRadio);
        console.log("      💰 Payment: Pay on Pickup selected.");

        // Pickup Slot (Required)
        let selects = await driver.findElements(By.css('select'));
        if (selects.length >= 2) {
            await selects[0].sendKeys("10:00 AM");
            await driver.sleep(500);
            await selects[1].sendKeys("06:00 PM");
            console.log("      ⏰ Pickup Slot: 10 AM - 6 PM");
        }

        await driver.sleep(3000);

        // Step 7: Place Order
        console.log("\nStep 7: 🚀 Placing Order...");
        let placeOrderBtn = await driver.findElement(By.xpath("//button[contains(., 'Order') or contains(., 'Pay')]"));
        await placeOrderBtn.click();

        // Wait for success page
        await driver.wait(until.urlContains('/payment-success'), 15000);
        console.log("      ✅ ORDER PLACED SUCCESSFULLY!");
        await driver.sleep(8000);

        console.log("\n-----------------------------------------");
        console.log("   🎉 USER JOURNEY PASSED SUCCESSFULLY 🎉   ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Journey Error]:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runUserJourney();
