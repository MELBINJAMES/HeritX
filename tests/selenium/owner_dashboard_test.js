const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testOwnerDashboard() {
    console.log("\n=========================================");
    console.log("   👑 HERITX OWNER DASHBOARD TEST       ");
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
        console.log("Step 1: 👤 Logging in as Shop Owner...");
        await driver.get('http://localhost:3001/login');
        await driver.wait(until.elementLocated(By.xpath("//input[@type='email']")), 10000);
        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('owner@hertix.com');
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('Admin@123');
        let loginBtn = await driver.findElement(By.xpath("//button[contains(., 'Sign in') or contains(., 'Login')]"));
        await loginBtn.click();
        await driver.wait(until.urlContains('/'), 10000);
        console.log("      ✅ Logged in successfully.");
        await driver.sleep(2000);

        // Step 2: Navigate to Admin Dashboard
        console.log("\nStep 2: 🏗️ Navigating to Owner Dashboard (Port 5173)...");
        await driver.get('http://localhost:5173/');
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'HeritX')]")), 15000);
        console.log("      ✅ Dashboard loaded.");
        await driver.sleep(3000);

        // Step 3: Test Overview Tab
        console.log("\nStep 3: 📊 Checking Overview Stats...");
        let stats = await driver.findElements(By.css('.modern-card h3'));
        console.log(`      ✅ Found ${stats.length} statistical cards.`);
        await driver.sleep(2000);

        // Step 4: Test Inventory Management
        console.log("\nStep 4: 📦 Testing Inventory Section...");
        let invTab = await driver.findElement(By.xpath("//button[contains(., 'inventory')]"));
        await invTab.click();
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")), 5000);
        console.log("      ✅ Inventory tab active.");

        console.log("      Opening 'Add Product' modal...");
        let addBtn = await driver.findElement(By.xpath("//button[contains(., 'Add Product')]"));
        await addBtn.click();
        await driver.sleep(2000);

        let closeBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Close')]")), 5000);
        console.log("      ✅ Modal opened. Closing now...");
        await closeBtn.click();
        await driver.sleep(2000);

        // Step 5: Test Rentals (Orders) Management
        console.log("\nStep 5: 📋 Testing Rentals (Orders) Section...");
        let rentalsTab = await driver.findElement(By.xpath("//button[contains(., 'Rentals')]"));
        await rentalsTab.click();
        await driver.sleep(2000);
        console.log("      ✅ Rentals tab active.");

        try {
            let openBtn = await driver.findElement(By.xpath("//button[contains(., 'Open')]"));
            console.log("      Opening order details...");
            await openBtn.click();
            await driver.sleep(3000);
            console.log("      ✅ Order details viewed.");

            // Click outside or press ESC to close if it's a modal
            await driver.actions().sendKeys(Key.ESCAPE).perform();
            await driver.sleep(1000);
        } catch (e) {
            console.log("      ℹ️ No orders found to open.");
        }

        // Step 6: Test Analytics
        console.log("\nStep 6: 📈 Testing Analytics Section...");
        let analyticsTab = await driver.findElement(By.xpath("//button[contains(., 'analytics')]"));
        await analyticsTab.click();
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Revenue')]")), 10000);
        console.log("      ✅ Analytics charts loaded.");
        await driver.sleep(3000);

        // Step 7: Test Settings
        console.log("\nStep 7: ⚙️ Testing Settings Section...");
        let settingsTab = await driver.findElement(By.xpath("//button[contains(., 'settings')]"));
        await settingsTab.click();
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Settings')]")), 10000);
        console.log("      ✅ Settings categories viewed.");
        await driver.sleep(2000);

        // Step 8: Test Profile
        console.log("\nStep 8: 👤 Testing Profile Page...");
        let profileBtn = await driver.findElement(By.className("user-profile"));
        await profileBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'My Profile')]")), 10000);
        console.log("      ✅ Profile page reached.");
        await driver.sleep(3000);

        console.log("\n-----------------------------------------");
        console.log("   🎉 OWNER DASHBOARD TEST PASSED!        ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Dashboard Error]:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

testOwnerDashboard();
