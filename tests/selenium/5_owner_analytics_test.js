const { Builder, By, Key, until } = require('selenium-webdriver');

async function runAnalyticsTest() {
    console.log("\n=========================================");
    console.log("   📈 TEST 5: ANALYTICS & PERFORMANCE    ");
    console.log("=========================================\n");

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Step 1: Pre-login
        console.log("Step 1: Logging in to access Analytics...");
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        // Step 2: Navigate to Analytics
        console.log("Step 2: Navigating to Analytics Section...");
        let analyticsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'analytics')]")), 10000);
        await analyticsTab.click();
        await driver.sleep(2000);

        // Step 3: Verify Data Visualization
        console.log("Step 3: Checking Performance Charts...");
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Revenue')]")), 10000);
        console.log("      ✅ Revenue Trends card found.");

        let stats = await driver.findElements(By.className("modern-card"));
        console.log(`      ✅ Found ${stats.length} analytical data modules.`);

    } catch (error) {
        console.error("\n❌ ANALYTICS TEST FAILED:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runAnalyticsTest();
