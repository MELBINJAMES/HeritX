const { Builder, By, Key, until } = require('selenium-webdriver');

async function runLoginTest() {
    console.log("\n=========================================");
    console.log("   🔐 TEST 2: OWNER LOGIN VERIFICATION   ");
    console.log("=========================================\n");

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log("Step 1: Navigating to Shop Owner Login (Port 3002)...");
        await driver.get('http://localhost:3002/shop-owner/login');

        await driver.wait(until.elementLocated(By.id("email-input")), 10000);

        console.log("Step 2: Entering Shop Owner Credentials...");
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');

        console.log("Step 3: Clicking Sign In...");
        await driver.findElement(By.id("submit-btn")).click();

        console.log("Step 4: Verifying Dashboard Access...");
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 15000);
        console.log("      ✅ SUCCESS: Landed on " + await driver.getCurrentUrl());

        // Final sanity check for Owner UI
        let sellerBadge = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Seller')]")), 5000);
        console.log("      ✅ Verified 'Seller' status in Dashboard.");

    } catch (error) {
        console.error("\n❌ LOGIN TEST FAILED:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runLoginTest();
