const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testAdminDashboard3002() {
    console.log("\n=========================================");
    console.log("   🛡️  HERITX ADMIN DASHBOARD TEST (3002) ");
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
        console.log("Step 1: 👤 Logging in to Admin Dashboard (Port 3002)...");
        await driver.get('http://localhost:3002/shop-owner/login');

        console.log("      Entering Admin credentials: admin@example.com / Password@123");
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('admin@example.com');
        await driver.findElement(By.id("password-input")).sendKeys('Password@123');

        let loginBtn = await driver.findElement(By.id("submit-btn"));
        await loginBtn.click();

        // Step 2: Verification of Admin Dashboard Redirect
        console.log("      Waiting for redirect to /admin/dashboard...");
        await driver.wait(until.urlContains('/admin/dashboard'), 15000);
        console.log("      ✅ Redirected to ADMIN Dashboard successfully.");
        await driver.sleep(3000);

        // Step 3: Precise UI Verification
        console.log("\nStep 2: 🏗️ Verifying Admin-Specific UI Elements...");

        // 3a. Check Sidebar "ADMIN" Label
        let adminLabel = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'ADMIN')]")), 10000);
        console.log("      ✅ Sidebar 'ADMIN' tag detected.");

        // 3b. Check Profile Name "Administrator"
        let profileName = await driver.findElement(By.xpath("//span[contains(text(), 'Administrator')]"));
        console.log("      ✅ Profile name 'Administrator' verified.");

        // 3c. Check Avatar "AD"
        let avatar = await driver.findElement(By.xpath("//div[contains(text(), 'AD') and contains(@class, 'avatar')]"));
        console.log("      ✅ Admin Avatar 'AD' confirmed.");

        // Step 4: System Module Check
        console.log("\nStep 3: 📋 Verifying System Modules...");
        const adminModules = ['Verify Shops', 'All Shops', 'Customers', 'Catalog Config', 'System Logs'];

        for (const module of adminModules) {
            let moduleBtn = await driver.findElement(By.xpath(`//button[contains(., '${module}')]`));
            console.log(`      ✅ Module found: ${module}`);
        }

        // Step 5: Test One Module (e.g., System Logs)
        console.log("\nStep 4: 📜 Testing 'System Logs' module...");
        let logsBtn = await driver.findElement(By.xpath("//button[contains(., 'System Logs')]"));
        await logsBtn.click();
        await driver.sleep(2000);

        let tableHeader = await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Audit Trail')]")), 5000);
        console.log("      ✅ 'Audit Trail' logs loaded correctly.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 ADMIN DASHBOARD VERIFIED SUCCESSFULLY! ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Admin Verification Error]:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

testAdminDashboard3002();
