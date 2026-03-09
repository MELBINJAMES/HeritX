const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runSeleniumTest() {
    console.log("=========================================");
    console.log("Starting HeritX Selenium Automation Test");
    console.log("=========================================\n");

    // Initialize Chrome in non-headless mode so the user can physically watch it
    let options = new chrome.Options();
    // options.addArguments('headless'); // Keep this commented out so the browser physically pops up!

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("[Selenium] -> Opening Chrome Browser...");

        // 1. Navigate to HeritX Landing Page
        console.log("[Selenium] -> Navigating to http://localhost:3001/");
        await driver.get('http://localhost:3001/');

        // Wait for the main catchphrase to ensure the page loaded
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Rent Authentic')]")), 5000);
        await driver.sleep(1000); // Pause for a second so humans can see

        // 2. Click the 'Browse Items' button
        console.log("[Selenium] -> Clicking the 'Browse Items' button...");
        let browseButton = await driver.findElement(By.xpath("//button[contains(., 'Browse Items')] | //a[contains(., 'Browse Items')]"));
        await browseButton.click();

        // Wait for the URL to change to the catalog
        await driver.wait(until.urlContains('/browse'), 5000);
        await driver.sleep(1000); // Pause for observation

        // 3. Search for 'Onam' in the catalog
        console.log("[Selenium] -> Finding the Search Bar and typing 'Onam'...");
        // Assuming the search bar is an input field
        let searchInput = await driver.wait(until.elementLocated(By.css("input[placeholder*='Search']")), 5000);
        await searchInput.sendKeys('Onam');
        await driver.sleep(2000); // Leave it typed in for a moment so the user can see it!

        console.log("\n=========================================");
        console.log("      SELENIUM TEST PASSED SUCCESSFULLY     ");
        console.log("=========================================");

        console.log("\nLeaving the browser open for 4 seconds before exiting...");
        await driver.sleep(4000);

    } catch (error) {
        console.error("\n[Selenium Error] -> Test Execution Failed:", error);
    } finally {
        // Quit the browser and end the test
        await driver.quit();
        console.log("[Selenium] -> Browser process closed.");
    }
}

// Execute the test
runSeleniumTest();
