const { Builder, By, until } = require('selenium-webdriver');

async function runShortTest() {
    console.log("\n🚀 RUNNING SHORT RENTER TEST...");
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3001/login');

        // Quick modal dismissal to prevent "click intercepted" error
        try { await (await driver.wait(until.elementLocated(By.id("detect-location-btn")), 3000)).click(); } catch (e) { }

        // 1. Login
        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('owner@hertix.com');
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('password123');
        await driver.findElement(By.xpath("//button[@type='submit']")).click();

        // 2. Check Dashboard
        await driver.wait(until.urlIs('http://localhost:3001/'), 10000);
        await driver.get('http://localhost:3001/dashboard');
        console.log("✅ Reached Dashboard.");
        await driver.sleep(2000);

        // 3. Logout
        await (await driver.wait(until.elementLocated(By.css('.logout')), 5000)).click();

        await driver.wait(until.urlIs('http://localhost:3001/'), 5000);
        console.log("✅ Logout Successful. 🎉 TEST PASSED!");

    } catch (error) { console.error("❌ ERROR:", error.message); }
    finally { await driver.quit(); }
}

runShortTest();
