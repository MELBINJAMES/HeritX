const { Builder, By, Key, until } = require('selenium-webdriver');

async function testInventory() {
    console.log("\n[TEST 3] 📦 INVENTORY FUNCTIONALITY");
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Login first
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        console.log("      Navigating to Inventory...");
        let invTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'inventory')]")), 10000);
        await invTab.click();

        await driver.sleep(2000);
        console.log("      Opening 'Add Product' modal...");
        let addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Add Product')]")), 10000);
        await addBtn.click();

        await driver.sleep(2000);
        let closeBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Close') or contains(text(), '✕')]")), 5000);
        console.log("      ✅ Inventory list and Add Modal verified.");
        await closeBtn.click();

    } catch (error) {
        console.error("      ❌ Inventory Test Failed:", error.message);
    } finally {
        await driver.quit();
    }
}
testInventory();
