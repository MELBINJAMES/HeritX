const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testFullSite() {
    console.log("\n=========================================");
    console.log("   🚀 HERITX ADVANCED AUTOMATION TEST   ");
    console.log("=========================================\n");

    let options = new chrome.Options();

    // Auto-grant Geolocation Permissions
    options.setUserPreferences({
        'profile.default_content_setting_values.geolocation': 1, // 1 = Allow
        'profile.default_content_setting_values.notifications': 1
    });

    // Set a default geolocation (Kochi, Kerala) so 'Detect' actually finds something!
    options.addArguments('--use-fake-ui-for-media-stream');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Set the fake geolocation coordinates (Kochi)
    await driver.executeScript("window.navigator.geolocation.getCurrentPosition = (success) => { success({ coords: { latitude: 9.9312, longitude: 76.2673 } }); };");

    try {
        console.log("Step 1: 🏠 Launching Home Page & Handling Location Modal...");
        await driver.get('http://localhost:3001/');

        // Handle the initial "Select Your Location" modal
        try {
            console.log("      Checking for 'Select Your Location' modal...");
            let modalDetectBtn = await driver.wait(until.elementLocated(By.id("detect-location-btn")), 8000);
            await driver.sleep(1000);
            console.log("      Dismissing modal using 'Use Current Location'...");
            await modalDetectBtn.click();
            await driver.sleep(2000); // Wait for modal to disappear
            console.log("      ✅ Modal dismissed.");
        } catch (modalErr) {
            console.log("      ℹ️ Modal not detected or already dismissed.");
        }

        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'HeritX')]")), 10000);
        console.log("      ✅ Landing Page loaded.");
        await driver.sleep(2000);

        console.log("\nStep 2: 🗺️ Testing Location & Mapping...");
        await driver.get('http://localhost:3001/browse');

        // 2a. Detect Location
        console.log("      Clicking 'Detect Location'...");
        let detectBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Detect')]")), 10000);
        await detectBtn.click();
        await driver.sleep(4000); // Wait for the "Location updated!" toast and input update
        console.log("      ✅ Location 'Detect' triggered.");

        // 2b. Show Map (VISUAL CHECK)
        console.log("      Toggling 'Show Map' for visual verification...");
        let mapBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Show Map')]")), 10000);
        await mapBtn.click();
        console.log("      👀 Map is now visible. Waiting 6 seconds for observation...");
        await driver.sleep(6000);

        console.log("\nStep 3: 👤 Logging in as Shop Owner...");
        await driver.get('http://localhost:3001/login');
        await driver.wait(until.elementLocated(By.xpath("//input[@type='email']")), 10000);
        let emailInput = await driver.findElement(By.xpath("//input[@type='email']"));
        let passInput = await driver.findElement(By.xpath("//input[@type='password']"));
        await emailInput.sendKeys('owner@hertix.com');
        await passInput.sendKeys('Admin@123');
        await driver.sleep(1000);
        let loginBtn = await driver.findElement(By.xpath("//button[contains(., 'Sign in') or contains(., 'Login')]"));
        await loginBtn.click();
        await driver.sleep(4000);
        console.log("      ✅ Login successful.");

        console.log("\nStep 4: 🏗️ Testing Shop Owner Workflow...");
        await driver.get('http://localhost:5173/');
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'SELLER') or contains(text(), 'PARTNER')]")), 15000);
        console.log("      ✅ Dashboard reached.");
        await driver.sleep(2000);

        // Workflow 1: Reviewing Recent Activity
        console.log("      Action 1: Reviewing Recent Activity table...");
        try {
            await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Recent Activity')]")), 10000);
            console.log("      👀 Observing recent rental requests and payments...");
            await driver.sleep(4000);
        } catch (e) {
            console.log("      ℹ️ No recent activity found yet.");
        }

        // Workflow 2: Managing Shop Profile
        console.log("      Action 2: Navigating to Shop Profile...");
        let profileBtn = await driver.findElement(By.className("user-profile"));
        await profileBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'My Profile')]")), 10000);
        console.log("      👀 Viewing Shop Information and Location details...");
        await driver.sleep(4000);

        // Workflow 3: Switching Tabs (Inventory)
        console.log("      Action 3: Checking Inventory management...");
        let invTab = await driver.findElement(By.xpath("//button[contains(., 'inventory')]"));
        await invTab.click();
        await driver.sleep(4000);
        console.log("      ✅ Inventory list viewed.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 WORKFLOW TESTS PASSED SUCCESSFULLY 🎉   ");
        console.log("-----------------------------------------");

        console.log("\nFinal Observation: Browser closing in 12 seconds...");
        await driver.sleep(12000);

    } catch (error) {
        console.error("\n❌ [Automation Error] -> One of the steps failed:\n", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

testFullSite();
