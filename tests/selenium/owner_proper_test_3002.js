const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testOwnerProper3002() {
    console.log("\n=========================================");
    console.log("   👑 SHOP OWNER DASHBOARD VERIFICATION  ");
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
        // Step 1: Login Flow as Owner
        console.log("Step 1: 👤 Logging in as Shop Owner (owner@hertix.com)...");
        await driver.get('http://localhost:3002/shop-owner/login');

        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123'); // Verified correct owner pass

        let loginBtn = await driver.findElement(By.id("submit-btn"));
        await loginBtn.click();

        // Step 2: Strict Dashboard Verification (Ensure NOT Admin)
        console.log("      Verifying Shop Owner Dashboard redirect...");
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 15000);

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes('/admin/dashboard')) {
            throw new Error("🚨 ERROR: Redirected to ADMIN dashboard instead of Shop Owner dashboard!");
        }
        console.log("      ✅ Correctly landed on /shop-owner/dashboard.");
        await driver.sleep(3000);

        // Step 3: Owner Branding & Role Confirmation
        console.log("\nStep 2: 🏗️ Verifying Owner-Specific Branding...");

        // 3a. Check for "Seller" badge instead of "ADMIN"
        let sellerBadge = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Seller')]")), 10000);
        console.log("      ✅ 'Seller' badge detected (Confirmed Owner Context).");

        // 3b. Check User Profile Display
        let profile = await driver.findElement(By.className("user-profile"));
        let profileText = await profile.getText();
        console.log(`      ✅ Owner Profile active: ${profileText}`);

        // Step 4: Proper Module Workflow (Owner Exclusives)
        console.log("\nStep 3: 📋 Testing Owner Dashboard Modules...");

        // 4a. Inventory Management
        console.log("      Checking Inventory module...");
        let invTab = await driver.findElement(By.xpath("//button[contains(., 'inventory')]"));
        await invTab.click();
        await driver.sleep(2000);

        let addProductBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")), 5000);
        console.log("      ✅ Inventory tab active. '+ Add Product' button found.");

        // 4b. Rentals (Orders)
        console.log("      Checking Rentals (Orders) module...");
        let rentalsTab = await driver.findElement(By.xpath("//button[contains(., 'Rentals')]"));
        await rentalsTab.click();
        await driver.sleep(2000);
        console.log("      ✅ Rentals tab active.");

        // 4c. Analytics
        console.log("      Checking Analytics module...");
        let analyticsTab = await driver.findElement(By.xpath("//button[contains(., 'analytics')]"));
        await analyticsTab.click();
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Revenue Trends')]")), 5000);
        console.log("      ✅ Analytics charts are visible.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 SHOP OWNER DASHBOARD VERIFIED!      ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Verification Failed]:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

testOwnerProper3002();
