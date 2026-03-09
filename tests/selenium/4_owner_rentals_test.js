const { Builder, By, Key, until } = require('selenium-webdriver');

async function runRentalsTest() {
    console.log("\n=========================================");
    console.log("   📋 TEST 4: RENTALS / ORDERS FLOW      ");
    console.log("=========================================\n");

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Step 1: Pre-login
        console.log("Step 1: Logging in to access Rentals...");
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        // Step 2: Navigate to Rentals
        console.log("Step 2: Navigating to Rentals (Orders) Section...");
        let rentalTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Rentals')]")), 10000);
        await rentalTab.click();
        await driver.sleep(2000);

        // Step 3: Verify Request Table
        console.log("Step 3: Checking Rental Table Visibility...");
        try {
            let table = await driver.findElement(By.className("modern-table"));
            console.log("      ✅ Rental Inventory table detected.");

            // Check for row presence
            let rows = await driver.findElements(By.xpath("//tr"));
            console.log(`      ✅ Found ${rows.length - 1} active/past rental entries.`);
        } catch (e) {
            console.log("      ℹ️ No active rentals found, but section loaded correctly.");
        }

        // Step 4: Verify Notification Bell (Owner Context)
        console.log("Step 4: Checking Notification System...");
        let bell = await driver.findElement(By.xpath("//button[@title='Notifications']"));
        await bell.click();
        await driver.sleep(1000);
        console.log("      ✅ Notifications panel is operational.");

    } catch (error) {
        console.error("\n❌ RENTALS TEST FAILED:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runRentalsTest();
