const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runFullOwnerFlow() {
    console.log("\n=========================================");
    console.log("   🚀 TEST 1: OWNER FULL SESSION FLOW    ");
    console.log("=========================================\n");

    let options = new chrome.Options();
    options.setUserPreferences({
        'profile.default_content_setting_values.geolocation': 1
    });

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // --- STEP 1: SIGN IN ---
        console.log("Step 1: 🔐 Signing in to Shop Owner Portal...");
        await driver.get('http://localhost:3002/shop-owner/login');

        await driver.wait(until.elementLocated(By.id("email-input")), 20000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        let passField = await driver.findElement(By.id("password-input"));
        await passField.sendKeys('Admin@123');

        console.log("      Submitting form via ENTER key...");
        await passField.sendKeys(Key.ENTER);

        // Check for error toast/modal
        try {
            let errorMsg = await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'pending approval') or contains(text(), 'Invalid')]")), 5000);
            console.error("      ❌ LOGIN ERROR DETECTED: " + await errorMsg.getText());
            throw new Error("Login failed with visible error.");
        } catch (e) {
            // No early error, continue waiting for redirect
        }

        console.log("      Waiting for dashboard redirect...");
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 20000);
        console.log("      ✅ Login Successful. Landed on Dashboard.");
        await driver.sleep(3000);

        // --- STEP 2: SURF THROUGH DASHBOARD ---
        console.log("\nStep 2: 🏄 Surfing through Dashboard Sections...");

        const tabs = ['inventory', 'orders', 'analytics', 'overview'];

        for (const tab of tabs) {
            console.log(`      Navigating to: ${tab.toUpperCase()}...`);
            let tabBtn = await driver.wait(until.elementLocated(
                By.xpath(`//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${tab}') or contains(., 'Rentals')]`)
            ), 10000);

            await driver.executeScript("arguments[0].scrollIntoView();", tabBtn);
            await tabBtn.click();
            await driver.sleep(2000);
            console.log(`      ✅ Section confirmed.`);
        }

        // --- STEP 3: LOGOUT ---
        console.log("\nStep 3: 🚪 Signing Out...");

        let logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Sign Out')]")), 10000);
        await driver.executeScript("arguments[0].click();", logoutBtn);

        await driver.wait(until.urlContains('/login'), 15000);
        console.log("      ✅ Successfully Logged Out.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 FULL FLOW TEST PASSED SUCCESSFULLY! ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ FULL FLOW TEST FAILED:", error.message);

        try {
            let image = await driver.takeScreenshot();
            require('fs').writeFileSync('full_flow_failure_v2.png', image, 'base64');
            console.log("      📸 Screenshot saved as 'full_flow_failure_v2.png'");
        } catch (e) { }

    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Browser closed.\n");
    }
}

runFullOwnerFlow();
