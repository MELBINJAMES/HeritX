const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runUserDashboardTest() {
    console.log("\n=========================================");
    console.log("   👤  HERITX USER DASHBOARD TEST        ");
    console.log("=========================================\n");

    let options = new chrome.Options();
    // options.addArguments('--headless'); // Disabled for visibility as per user request
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Step 1: Open Login Page
        console.log("Step 1: 🔐 Opening Login Page...");
        await driver.get('http://localhost:3001/login');

        // Mock geolocation (Kochi)
        await driver.executeScript("window.navigator.geolocation.getCurrentPosition = (success) => { success({ coords: { latitude: 9.9312, longitude: 76.2673 } }); };");

        // Handle Location Modal
        try {
            console.log("      Checking for location modal...");
            let detectBtn = await driver.wait(until.elementLocated(By.id("detect-location-btn")), 5000);
            await driver.sleep(1000);
            console.log("      Dismissing modal using 'detect-location-btn'...");
            await detectBtn.click();
            await driver.sleep(2000);
        } catch (e) {
            console.log("      ℹ️ Location modal not found or already dismissed.");
        }

        // Step 2: Perform Login
        console.log("Step 2: 👤 Entering credentials...");
        await driver.wait(until.elementLocated(By.xpath("//input[@type='email']")), 10000);
        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('owner@hertix.com');
        await driver.sleep(1000);
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('password123');
        await driver.sleep(1000);

        console.log("      Clicking Sign In...");
        let loginBtn = await driver.findElement(By.xpath("//button[@type='submit']"));
        await loginBtn.click();

        // Step 3: Wait for Redirection to Home
        console.log("Step 3: 📊 Waiting for Home Page...");
        await driver.wait(until.urlIs('http://localhost:3001/'), 15000);
        console.log("      ✅ Successfully logged in and reached Home.");

        await driver.sleep(2000); // Wait for UI to stabilize

        // Step 4: Navigate to User Dashboard via Profile Menu
        console.log("Step 4: 🧭 Navigating to User Dashboard...");

        // Find and click profile name to open dropdown
        console.log("      Opening profile menu...");
        let profileMenuTrigger = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Melbin James')]/..")), 10000);
        await driver.executeScript("arguments[0].click();", profileMenuTrigger);
        await driver.sleep(1500);

        // Click "My Profile" to go into dashboard area
        console.log("      Clicking 'My Profile'...");
        let myProfileLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'My Profile')]")), 5000);
        await driver.executeScript("arguments[0].click();", myProfileLink);

        // Wait for dashboard layout to load
        console.log("      Waiting for Dashboard layout...");
        await driver.wait(until.urlContains('/dashboard/profile'), 10000);

        // Find and click "Dashboard" in Sidebar
        console.log("      Navigating to Dashboard root...");
        let dashboardSidebarLink = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Dashboard')]")), 5000);
        await driver.executeScript("arguments[0].click();", dashboardSidebarLink);
        await driver.wait(until.urlIs('http://localhost:3001/dashboard'), 10000);
        console.log("      ✅ Successfully reached User Dashboard Root.");

        // Step 5: Perform Logout
        console.log("Step 5: 🚪 Performing Logout...");
        // Sidebar logout button has class "logout"
        let logoutBtn = await driver.wait(until.elementLocated(By.css('.logout')), 10000);
        await driver.executeScript("arguments[0].click();", logoutBtn);

        // Step 6: Verify Redirection after Logout
        console.log("Step 6: 🔄 Verifying redirection...");
        // According to AuthContext, it redirects to '/'
        await driver.wait(until.urlIs('http://localhost:3001/'), 15000);
        console.log("      ✅ Successfully logged out and redirected to Home.");

        console.log("\n-----------------------------------------");
        console.log("   🎉 USER DASHBOARD TEST PASSED 🎉     ");
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("\n❌ [Test Error]:", error.message);
        // Take a screenshot on failure
        let image = await driver.takeScreenshot();
        require('fs').writeFileSync('user_dashboard_failure.png', image, 'base64');
        console.log("      📸 Failure screenshot saved as user_dashboard_failure.png");
    } finally {
        await driver.quit();
        console.log("\n[Selenium] -> Test Complete. Browser closed.\n");
    }
}

runUserDashboardTest();
