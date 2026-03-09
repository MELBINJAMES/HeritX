# HeritX Owner Dashboard - Modular Testing Suite (Port 3002)

This directory contains five separate Selenium automation scripts to verify the Shop Owner workflow on port 3002. Each script can be run independently.

## Prerequisites
- Node.js installed
- Chrome Browser
- `selenium-webdriver` installed (`npm install selenium-webdriver`)

## Test Scripts

### 1. Registration (`1_owner_registration_test.js`)
- **Goal:** Verifies the full sign-up flow for a new shop owner.
- **Outcome:** Checks for the "Request Submitted / Pending Approval" modal.
- **Run:** `node 1_owner_registration_test.js`

### 2. Login (`2_owner_login_test.js`)
- **Goal:** Verifies login for an existing, approved owner.
- **Credentials:** `owner@hertix.com` / `Admin@123`
- **Run:** `node 2_owner_login_test.js`

### 3. Inventory (`3_owner_inventory_test.js`)
- **Goal:** Verifies the stock management section.
- **Action:** Checks listing visibility and opens the "Add Product" modal.
- **Run:** `node 3_owner_inventory_test.js`

### 4. Rentals/Orders (`4_owner_rentals_test.js`)
- **Goal:** Verifies the tracking of customer rental requests.
- **Action:** Navigates to the Rentals tab and verifies the order table.
- **Run:** `node 4_owner_rentals_test.js`

### 5. Analytics (`5_owner_analytics_test.js`)
- **Goal:** Verifies business performance metrics.
- **Action:** Confirms that revenue charts and performance graphs are rendering.
- **Run:** `node 5_owner_analytics_test.js`

---
*Note: Make sure your local server is running on port 3002 before starting tests.*
