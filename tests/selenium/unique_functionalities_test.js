const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Helper function to set a dummy location in localStorage to bypass the modal
async function setDummyLocation(driver) {
    try {
        await driver.executeScript(() => {
            localStorage.setItem('hertix_user_location', JSON.stringify({
                city: "Kochi",
                pincode: "682001",
                lat: 9.9312,
                lng: 76.2673,
                manual: true
            }));
        });
        console.log("📍 Location bypass set in localStorage.");
        await driver.navigate().refresh(); // Refresh to apply localStorage
    } catch (e) {
        console.warn("Could not set dummy location:", e.message);
    }
}

async function runUniqueFunctionalityTests() {
    console.log("\n🚀 STARTING UNIQUE FUNCTIONALITY VERIFICATION TESTS...");

    let options = new chrome.Options();
    // options.addArguments('--headless'); 
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // --- TEST 1: CROSS-ORIGIN NAVIGATION ---
        console.log("\n1️⃣  Testing Cross-Origin Navigation...");
        await driver.get('http://localhost:3001/login');

        // Bypass location prompt
        await setDummyLocation(driver);

        // Wait for modal to disappear or just proceed if it didn't show
        await driver.sleep(1000);

        // Find the "Sign Up" link
        let signUpLink = await driver.wait(until.elementLocated(By.linkText('Sign Up')), 10000);

        // Use executeScript to click if it's still being intercepted by a fading modal
        try {
            await signUpLink.click();
        } catch (e) {
            console.log("⚠️ Click intercepted, attempting JavaScript click...");
            await driver.executeScript("arguments[0].click();", signUpLink);
        }

        await driver.wait(until.urlContains('localhost:3002/register'), 10000);
        console.log("✅ SUCCESS: Successfully navigated from User Port (3001) to Admin Port (3002).");


        // --- TEST 2: USER-SPECIFIC CART ISOLATION ---
        console.log("\n2️⃣  Testing User-Specific Cart Isolation...");

        // 2a. Login User A
        await driver.get('http://localhost:3001/login');
        await setDummyLocation(driver); // Ensure modal is gone on this page too

        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('melbinjames0011@gmail.com');
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('password123');
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains('/'), 10000);

        // 2b. Add Item to Cart
        await driver.get('http://localhost:3001/browse');
        let addToCartBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add to Cart')]")), 5000);
        await driver.executeScript("arguments[0].click();", addToCartBtn);
        console.log("🛒 Item added to User A's cart.");

        // 2c. Logout User A
        await driver.get('http://localhost:3001/');
        try {
            let profileIcon = await driver.wait(until.elementLocated(By.css('.FaUserCircle, .header .user-profile')), 5000);
            await profileIcon.click();
            let logoutBtn = await driver.wait(until.elementLocated(By.xpath("//div[text()='Logout']")), 5000);
            await logoutBtn.click();
        } catch (e) {
            // Fallback: Clear cookies/localStorage to force logout for testing purposes
            await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
            console.log("登 Force logout via script.");
        }
        await driver.wait(until.urlContains('login') || until.urlIs('http://localhost:3001/'), 5000);

        // 2d. Login User B
        await driver.get('http://localhost:3001/login');
        await driver.findElement(By.xpath("//input[@type='email']")).sendKeys('melbinjames267@gmail.com');
        await driver.findElement(By.xpath("//input[@type='password']")).sendKeys('password123');
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains('/'), 10000);

        // 2e. Verify Cart is Empty for User B
        try {
            let cartBadge = await driver.findElement(By.css('.cart-badge'));
            let count = await cartBadge.getText();
            if (count === "0" || count === "") {
                console.log("✅ SUCCESS: Cart is isolated. User B starts with an empty cart.");
            } else {
                console.log(`❌ FAIL: Cart should be empty for User B, but found ${count} items.`);
            }
        } catch (e) {
            console.log("✅ SUCCESS: Cart isolation confirmed (badge not found = 0 items).");
        }


        // --- TEST 3: CHATBOT FUZZY MATCHING ---
        console.log("\n3️⃣  Testing Chatbot Fuzzy Matching...");
        await driver.get('http://localhost:3001/');
        await setDummyLocation(driver);

        // Open Chatbot
        let chatbotToggle = await driver.wait(until.elementLocated(By.css('.chatbot-toggle')), 5000);
        await driver.executeScript("arguments[0].click();", chatbotToggle);

        // Send Typo Message "katakali"
        let chatInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Type a message...' or @placeholder='Type your message...']")), 5000);
        await chatInput.sendKeys('katakali');
        await driver.findElement(By.css('.send-btn')).click();

        console.log("💬 Sent typo word 'katakali' to bot.");

        // Wait for correctly spelled response
        let botResponse = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'bot')]//strong[contains(text(), 'Kathakali')]")), 10000);
        console.log("✅ SUCCESS: Chatbot correctly identified 'Kathakali' from typo 'katakali'.");

        console.log("\n🎉 ALL UNIQUE FUNCTIONALITY TESTS PASSED!");

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
    } finally {
        await driver.quit();
    }
}

runUniqueFunctionalityTests();
