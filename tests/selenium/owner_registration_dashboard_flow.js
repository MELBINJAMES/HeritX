const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');

async function runOwnerFlowTest() {
    console.log("\n" + "=".repeat(60));
    console.log("   🚀 STARTING TEST: OWNER REGISTRATION & DASHBOARD FLOW");
    console.log("=".repeat(60) + "\n");

    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    const dummyProofPath = path.join(__dirname, 'test_shop_license.txt');
    if (!fs.existsSync(dummyProofPath)) {
        fs.writeFileSync(dummyProofPath, 'Automated Test Proof for HeritX Registration.');
    }

    try {
        console.log("[1/9] Navigating to Registration...");
        await driver.get('http://localhost:3002/register');

        console.log("[2/9] Selecting 'Shop Owner' Role...");
        const ownerTab = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Shop Owner')]")), 15000);
        await driver.wait(until.elementIsVisible(ownerTab), 5000);
        await ownerTab.click();

        console.log("[3/9] Entering Account Details...");
        const uniqueSuffix = Math.floor(Date.now() / 1000);
        const testEmail = `owner_${uniqueSuffix}@test-auto.com`;
        const testPassword = 'Password@123';

        await driver.findElement(By.xpath("//input[@placeholder='Asha Nair' or @placeholder='HeritX Boutique']")).sendKeys('Selenium Shop ' + uniqueSuffix);
        await driver.findElement(By.id("email-input")).sendKeys(testEmail);
        await driver.findElement(By.id("password-input")).sendKeys(testPassword);
        await driver.findElement(By.xpath("//input[@placeholder='Verify Password']")).sendKeys(testPassword);

        console.log("      - Filling Shop Details...");
        await driver.findElement(By.xpath("//input[@placeholder='Building No, Street Name, Area']")).sendKeys('123 Selenium Lane');
        await driver.findElement(By.xpath("//input[@placeholder='e.g. Cochin']")).sendKeys('Cochin');
        await driver.findElement(By.xpath("//input[@placeholder='682001']")).sendKeys('682001');
        await driver.findElement(By.xpath("//input[@placeholder='+91 98765 43210']")).sendKeys('919876543210');

        console.log("[4/9] Uploading Shop Proof...");
        let fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
        await fileInput.sendKeys(dummyProofPath);

        console.log("[5/9] Submitting Registration Form...");
        const submitRegBtn = await driver.findElement(By.id("submit-btn"));
        await driver.executeScript("arguments[0].scrollIntoView();", submitRegBtn);
        await submitRegBtn.click();

        console.log("[6/9] Verifying Success Modal & Redirect...");
        const loginRedirectBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Continue to Login')]")), 20000);
        await driver.wait(until.elementIsVisible(loginRedirectBtn), 5000);
        await loginRedirectBtn.click();

        console.log("[7/9] Performing Login (Email: " + testEmail + ")...");
        await driver.wait(until.urlContains('/shop-owner/login'), 15000);
        await driver.wait(until.elementLocated(By.id("email-input")), 5000);
        await driver.findElement(By.id("email-input")).sendKeys(testEmail);
        await driver.findElement(By.id("password-input")).sendKeys(testPassword);

        console.log("      - Clicking Sign In...");
        const loginBtn = await driver.wait(until.elementLocated(By.id("submit-btn")), 5000);
        // Using form submit for robustness since it's a form element
        await driver.executeScript("arguments[0].closest('form').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));", loginBtn);

        console.log("[8/9] Verifying Dashboard Redirection...");
        try {
            await driver.wait(until.urlContains('/shop-owner/dashboard'), 30000);
            console.log("      - Dashboard URL detected.");
        } catch (e) {
            const pageText = await driver.findElement(By.tagName('body')).getText();
            if (pageText.includes('pending approval')) {
                throw new Error("Login failed: Account is pending approval (Auto-approve hook failed)");
            } else if (pageText.includes('Invalid email or password')) {
                throw new Error("Login failed: Invalid credentials");
            } else {
                let screenshot = await driver.takeScreenshot();
                fs.writeFileSync(path.join(__dirname, 'login_failure_state.png'), screenshot, 'base64');
                throw new Error("Login failed: URL did not change to dashboard. Screenshot captured.");
            }
        }

        const welcomeHeading = await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Welcome')]")), 20000);
        await driver.wait(until.elementIsVisible(welcomeHeading), 10000);
        const headingText = await welcomeHeading.getText();
        console.log("      - Welcome Message Found: " + headingText);
        console.log("      ✅ Dashboard Access Verified!");

        console.log("[9/9] Performing Logout...");
        const logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Sign Out')]")), 15000);
        await driver.executeScript("arguments[0].scrollIntoView();", logoutBtn);
        await driver.wait(until.elementIsVisible(logoutBtn), 5000);
        await logoutBtn.click();

        await driver.wait(until.urlContains('/shop-owner/login') || until.urlMatches(/localhost:300[12]/), 15000);
        console.log("      ✅ Logout Successful.");

        console.log("\n" + "=".repeat(60));
        console.log("   🎉 ALL TESTS PASSED SUCCESSFULLY!");
        console.log("=".repeat(60) + "\n");

    } catch (error) {
        console.error("\n" + "!".repeat(60));
        console.error("   ❌ TEST FAILED: " + error.message);
        console.error("!".repeat(60) + "\n");

        try {
            let screenshot = await driver.takeScreenshot();
            const failurePath = path.join(__dirname, 'owner_flow_failure_final.png');
            fs.writeFileSync(failurePath, screenshot, 'base64');
            console.log("      📸 Failure screenshot saved to: " + failurePath);
        } catch (e) {
            console.error("      ⚠️ Could not save screenshot: " + e.message);
        }
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Session Closed.\n");
    }
}

runOwnerFlowTest();
