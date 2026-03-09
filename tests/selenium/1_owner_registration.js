const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');

async function testRegistration() {
    console.log("\n[TEST 1] 📝 SHOP OWNER REGISTRATION");
    let options = new chrome.Options();
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    // Create a dummy proof file if it doesn't exist
    const proofPath = path.join(__dirname, 'dummy_proof.txt');
    if (!fs.existsSync(proofPath)) fs.writeFileSync(proofPath, 'This is a dummy shop proof for automated testing.');

    try {
        await driver.get('http://localhost:3002/register/owner');
        await driver.wait(until.elementLocated(By.id("email-input")), 10000);

        console.log("      Filling registration form...");
        await driver.findElement(By.xpath("//input[@placeholder='HeritX Boutique']")).sendKeys('Test Shop ' + Date.now());
        await driver.findElement(By.id("email-input")).sendKeys('new_owner_' + Date.now() + '@example.com');
        await driver.findElement(By.id("password-input")).sendKeys('Password@123');
        await driver.findElement(By.xpath("//input[@placeholder='Re-enter password']")).sendKeys('Password@123');

        await driver.findElement(By.xpath("//input[@placeholder='Building No, Street Name']")).sendKeys('123 Test Street');
        await driver.findElement(By.xpath("//input[@placeholder='e.g. Cochin']")).sendKeys('Kochi');
        await driver.findElement(By.xpath("//input[@placeholder='682001']")).sendKeys('682001');
        await driver.findElement(By.xpath("//input[@placeholder='+91 98765...']")).sendKeys('919876543210');

        console.log("      Uploading dummy proof...");
        await driver.findElement(By.xpath("//input[@type='file']")).sendKeys(proofPath);

        await driver.findElement(By.id("submit-btn")).click();

        console.log("      Waiting for success modal...");
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Request Submitted')]")), 15000);
        console.log("      ✅ Registration successful (Pending Approval).");

    } catch (error) {
        console.error("      ❌ Registration Failed:", error.message);
    } finally {
        await driver.quit();
    }
}
testRegistration();
