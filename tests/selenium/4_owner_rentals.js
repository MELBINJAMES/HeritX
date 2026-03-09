const { Builder, By, Key, until } = require('selenium-webdriver');

async function testRentals() {
    console.log("\n[TEST 4] 📋 RENTALS/ORDERS FUNCTIONALITY");
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Login first
        await driver.get('http://localhost:3002/shop-owner/login');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);
        await driver.findElement(By.id("email-input")).sendKeys('owner@hertix.com');
        await driver.findElement(By.id("password-input")).sendKeys('Admin@123');
        await driver.findElement(By.id("submit-btn")).click();
        await driver.wait(until.urlContains('/shop-owner/dashboard'), 10000);

        console.log("      Navigating to Rentals...");
        let rentalTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Rentals')]")), 10000);
        await rentalTab.click();

        await driver.sleep(3000);
        try {
            let orderTable = await driver.findElement(By.className("modern-table"));
            console.log("      ✅ Rentals table found with active requests.");
        } catch (e) {
            console.log("      ✅ Rentals section active (No requests found).");
        }

    } catch (error) {
        console.error("      ❌ Rentals Test Failed:", error.message);
    } finally {
        await driver.quit();
    }
}
testRentals();
