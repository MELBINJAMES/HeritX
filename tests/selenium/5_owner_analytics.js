const { Builder, By, Key, until } = require('selenium-webdriver');

async function testAnalytics() {
    console.log("\n[TEST 5] 📈 ANALYTICS FUNCTIONALITY");
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Login first
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        console.log("      Navigating to Analytics...");
        let analyticsTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'analytics')]")), 10000);
        await analyticsTab.click();

        await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'Revenue')]")), 10000);
        console.log("      ✅ Analytics charts and revenue cards verified.");

    } catch (error) {
        console.error("      ❌ Analytics Test Failed:", error.message);
    } finally {
        await driver.quit();
    }
}
testAnalytics();
