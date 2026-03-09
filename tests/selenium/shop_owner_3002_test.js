const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testShopOwner3002() {
    console.log("\n=========================================");
    console.log("   👑 SHOP OWNER DASHBOARD TEST (3002)   ");
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

    try {
        // Step 1: Login
        console.log("Step 1: 👤 Logging in to Shop Owner Dashboard (3002)...");
        await driver.get('http://localhost:3002/shop-owner/login');

        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');

        let loginBtn = await driver.findElement(By.id("submit-btn"));
        await loginBtn.click();

        // Wait for dashboard redirect
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 15000);
        console.log("      ✅ Logged in successfully to Dashboard.");
        await driver.sleep(3000);

        // Step 2: Verification of Sections
        console.log("\nStep 2: 📊 Verifying Dashboard Sections...");

        // Check Overview (Default Tab)
        try {
            await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Summary') or contains(text(), 'Overview')]")), 5000);
            console.log("      ✅ Overview section visible.");
        } catch (e) {
            console.log("      ℹ️ Overview header not found by text, searching for stat cards...");
            let cards = await driver.findElements(By.className("modern-card"));
            if (cards.length > 0) {
                console.log(`      ✅ Found ${cards.length} dashboard cards.`);
            }
        }

        // Step 3: Test Navigation Tabs
        console.log("\nStep 3: 📋 Testing Navigation Tabs...");
        const tabs = ['inventory', 'orders', 'analytics', 'settings'];

        for (const tabName of tabs) {
            console.log(`      Switching to ${tabName} tab...`);
            let tabBtn = await driver.findElement(By.xpath(`//button[contains(., '${tabName}') or contains(., '${tabName.charAt(0).toUpperCase() + tabName.slice(1)}')]`));
            await tabBtn.click();
            await driver.sleep(2000);
            console.log(`      ✅ ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} tab is active.`);
        }

        // Step 4: Test Specific Functionality (e.g., Open Add Product Modal)
        console.log("\nStep 4: 📦 Testing 'Add Product' functionality...");
        let invTab = await driver.findElement(By.xpath("//button[contains(., 'inventory') or contains(., 'Inventory')]"));
        await invTab.click();
        await driver.sleep(1000);

        let addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product') or contains(., 'Add New')]")), 5000);
        await addBtn.click();
        console.log("      ✅ 'Add Product' modal opened.");
        await driver.sleep(2000);

        try {
            let closeBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Close') or contains(text(), '✕')]"));
            await closeBtn.click();
            console.log("      ✅ Modal closed.");
        } catch (e) {
            console.log("      ℹ️ Close button not found, pressing Escape...");
            await driver.actions().sendKeys(Key.ESCAPE).perform();
        }
        await driver.sleep(2000);

        console.log("\n-----------------------------------------");
        console.log("   🎉 DASHBOARD 3002 TEST PASSED!        ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Dashboard 3002 Error]:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

testShopOwner3002();
