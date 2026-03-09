const { Builder, By, Key, until } = require('selenium-webdriver');
const path = require('path');
const fs = require('fs');

async function runRegistrationTest() {
    console.log("\n=========================================");
    console.log("   📝 TEST 1: OWNER REGISTRATION FLOW    ");
    console.log("=========================================\n");

    let driver = await new Builder().forBrowser('chrome').build();

    // Ensure a dummy verification file exists
    const dummyProofPath = path.join(__dirname, 'test_shop_license.txt');
    if (!fs.existsSync(dummyProofPath)) {
        fs.writeFileSync(dummyProofPath, 'Automated Test Proof for HeritX Registration.');
    }

    try {
        console.log("Step 1: Navigating to Registration Page...");
        await driver.get('http://localhost:3002/register/owner');

        await driver.wait(until.elementLocated(By.id("email-input")), 10000);

        console.log("Step 2: Filling in Shop Details...");
        const uniqueSuffix = Date.now();

        // Full Name (Shop Name in this context)
        await driver.findElement(By.xpath("//input[@placeholder='HeritX Boutique']")).sendKeys('Automated Shop ' + uniqueSuffix);

        // Email
        await driver.findElement(By.id("email-input")).sendKeys('test_owner_' + uniqueSuffix + '@hertix.com');

        // Passwords
        await driver.findElement(By.id("password-input")).sendKeys('Password@123');
        await driver.findElement(By.xpath("//input[@placeholder='Re-enter password']")).sendKeys('Password@123');

        // Verification Fields
        await driver.findElement(By.xpath("//input[@placeholder='Building No, Street Name']")).sendKeys('789 Heritage Road');
        await driver.findElement(By.xpath("//input[@placeholder='e.g. Cochin']")).sendKeys('Cochin');
        await driver.findElement(By.xpath("//input[@placeholder='682001']")).sendKeys('682001');
        await driver.findElement(By.xpath("//input[@placeholder='+91 98765...']")).sendKeys('919876543210');

        console.log("Step 3: Uploading Shop Proof...");
        let fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
        await fileInput.sendKeys(dummyProofPath);

        console.log("Step 4: Submitting Registration...");
        await driver.findElement(By.id("submit-btn")).click();

        console.log("Step 5: Verifying Approval Modal...");
        let successHeading = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Request Submitted')]")), 15000);
        console.log("      ✅ SUCCESS: " + await successHeading.getText());

        let confirmBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Got it')]"));
        await confirmBtn.click();

        await driver.wait(until.urlContains('/shop-owner/login'), 5000);
        console.log("      ✅ Workflow redirected to Login as expected.");

    } catch (error) {
        console.error("\n❌ REGISTRATION TEST FAILED:", error.message);
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runRegistrationTest();
