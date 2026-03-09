const { Builder, By, Key, until } = require('selenium-webdriver');

async function testLogin() {
    console.log("\n[TEST 2] 🔐 SHOP OWNER LOGIN");
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);

        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();

        await driver.wait(until.urlContains('/shop-owner/dashboard'), 15000);
        console.log("      ✅ Login successful and redirected to Dashboard.");

    } catch (error) {
        console.error("      ❌ Login Failed:", error.message);
    } finally {
        await driver.quit();
    }
}
testLogin();
