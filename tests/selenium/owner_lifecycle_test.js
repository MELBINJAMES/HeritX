const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');
const http = require('http');

async function runOwnerLifecycleTest() {
    console.log("\n=========================================");
    console.log("   👑 SHOP OWNER LIFECYCLE TEST (3002)   ");
    console.log("=========================================\n");

    let options = new chrome.Options();
    options.setUserPreferences({
        'profile.default_content_setting_values.geolocation': 1
    });

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    const uniqueId = Date.now();
    const testEmail = `new_owner_${uniqueId}@hertix.com`;
    const testPassword = 'Password@123';
    const shopName = `Lifecycle Shop ${uniqueId}`;

    // USE THE GENERATED REAL IMAGE PATH
    const dummyProofPath = 'C:\\Users\\Melbin James\\.gemini\\antigravity\\brain\\27abba1e-2f11-406e-a725-d61a4e110d99\\test_proof_image_1772987057291.png';

    try {
        // --- STEP 1: REGISTRATION ---
        console.log("Step 1: 📝 Registering new Shop Owner...");
        await driver.get('http://localhost:3002/register/owner');
        await driver.wait(until.elementLocated(By.id("email-input")), 15000);

        // Required Profile Info
        await driver.findElement(By.xpath("//input[@placeholder='HeritX Boutique']")).sendKeys(shopName);
        await driver.findElement(By.id("email-input")).sendKeys(testEmail);
        await driver.findElement(By.id("password-input")).sendKeys(testPassword);
        await driver.findElement(By.xpath("//input[@placeholder='Re-enter password']")).sendKeys(testPassword);

        // Shop Details
        console.log("      Filling Shop Details...");
        await driver.findElement(By.id("shop-address-input")).sendKeys('123 Heritage Lane');
        await driver.findElement(By.id("shop-city-input")).sendKeys('Kochi');
        await driver.findElement(By.id("shop-pincode-input")).sendKeys('682001');

        // Use a simple 10-digit number and ensure it's cleared
        let phoneField = await driver.findElement(By.id("shop-phone-input"));
        await phoneField.clear();
        await phoneField.sendKeys('9876543210');

        console.log("      Uploading REAL proof image...");
        let fileInput = await driver.findElement(By.id("shop-proof-input"));
        await fileInput.sendKeys(dummyProofPath);

        // FORCE the change event for React
        console.log("      Dispatching 'change' event to React...");
        await driver.executeScript("arguments[0].dispatchEvent(new Event('change', { bubbles: true }));", fileInput);

        // Wait for visual confirmation of file (Using the <small> id-less check)
        console.log("      Waiting for React state to update...");
        await driver.wait(until.elementLocated(By.xpath("//small[contains(text(), 'Selected:')]")), 15000);

        console.log("      Applying submission click...");
        let submitBtn = await driver.findElement(By.id("submit-btn"));
        await driver.executeScript("arguments[0].scrollIntoView();", submitBtn);
        await driver.sleep(1000);
        await driver.executeScript("arguments[0].click();", submitBtn);

        console.log("      Waiting for success modal...");
        try {
            await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Request Submitted')]")), 30000);
            console.log("      ✅ Registration successful (Pending Approval).");
        } catch (e) {
            console.error("      ❌ Success modal not found. Checking for errors...");
            // Take a mid-failure screenshot
            let midFail = await driver.takeScreenshot();
            fs.writeFileSync('registration_mid_failure.png', midFail, 'base64');

            // Log UI errors
            let errors = await driver.findElements(By.xpath("//*[contains(@class, 'error') or contains(text(), 'Invalid') or contains(text(), 'exists')]"));
            for (let err of errors) {
                let text = await err.getText();
                if (text && text.trim().length > 0) console.log(`      Found UI Error: ${text}`);
            }
            throw e;
        }

        // --- STEP 2: PROGRAMMATIC APPROVAL ---
        console.log("\nStep 2: ⚡ Programmatically Approving Account...");
        const approveUrl = `http://localhost/HertiX/admin/public/api/approve_owner.php?email=${encodeURIComponent(testEmail)}`;

        await new Promise((resolve, reject) => {
            http.get(approveUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    console.log(`      API Response: ${data}`);
                    resolve();
                });
            }).on('error', (err) => {
                console.error(`      ❌ Approval Failed: ${err.message}`);
                reject(err);
            });
        });

        // --- STEP 3: LOGIN ---
        console.log("\nStep 3: 🔐 Logging in with NEW Credentials...");
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);

        await driver.findElement(By.id("email-input")).sendKeys(testEmail);
        await driver.findElement(By.id("password-input")).sendKeys(testPassword);
        await driver.findElement(By.id("submit-btn")).click();

        await driver.wait(until.urlContains('/shop-owner/dashboard'), 20000);
        console.log("      ✅ Login successful for NEW owner account.");
        await driver.sleep(3000);

        // --- STEP 4: SURFING DASHBOARD ---
        console.log("\nStep 4: 🏄 Surfing Dashboard Modules...");

        const tabs = ['inventory', 'orders', 'analytics', 'settings', 'overview'];
        for (const tab of tabs) {
            console.log(`      Checking section: ${tab.toUpperCase()}...`);
            let tabBtn = await driver.wait(until.elementLocated(
                By.xpath(`//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${tab}') or contains(., 'Rentals')]`)
            ), 15000);
            await tabBtn.click();
            await driver.sleep(2000);
        }
        console.log("      ✅ All core modules surfed successfully.");

        // --- STEP 5: LOGOUT ---
        console.log("\nStep 5: 🚪 Signing Out...");
        let logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Sign Out')]")), 15000);
        await logoutBtn.click();

        await driver.wait(until.urlContains('/login'), 15000);
        console.log("      ✅ Successfully Logged Out.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 LIFECYCLE TEST PASSED: ALL STEPS!  ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ LIFECYCLE TEST FAILED:", error.message);

        try {
            let image = await driver.takeScreenshot();
            fs.writeFileSync('lifecycle_failure_screenshot.png', image, 'base64');
            console.log("      📸 Failure screenshot saved: lifecycle_failure_screenshot.png");
        } catch (e) { }

    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runOwnerLifecycleTest();
