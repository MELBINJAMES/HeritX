const { Builder, By, Key, until } = require('selenium-webdriver');

async function runInventoryTest() {
    console.log("\n=========================================");
    console.log("   📦 TEST 3: INVENTORY FUNCTIONALITY    ");
    console.log("=========================================\n");

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Step 1: Pre-login
        console.log("Step 1: Logging in to access Inventory...");
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        // Step 2: Navigate to Inventory
        console.log("Step 2: Navigating to Inventory Section...");
        let invTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'inventory') or contains(., 'Inventory')]")), 10000);
        await invTab.click();
        await driver.sleep(2000);

        // Step 3: Verify Management UI
        console.log("Step 3: Checking Inventory Tools...");
        let addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")), 5000);
        console.log("      ✅ '+ Add Product' button detected.");

        let searchInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Search inventory...']")), 5000);
        console.log("      ✅ Inventory search filter is accessible.");

        // Step 4: Open Add Product Modal
        console.log("Step 4: Testing 'Add Product' Modal...");
        await addBtn.click();
        await driver.sleep(2000);

        let modalHeading = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Add New Item')]")), 5000);
        console.log("      ✅ " + await modalHeading.getText() + " modal opened.");

        let closeBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Close') or contains(text(), '✕')]"));
        await closeBtn.click();
        console.log("      ✅ Modal closed correctly.");

    } catch (error) {
        console.error("\n❌ INVENTORY TEST FAILED:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runInventoryTest();
