# Dashboard Connectivity Fixes

## Goal
Establish dynamic connection between frontend and backend by removing hardcoded user IDs and updating API service calls to use authenticated user context.

## Proposed Changes

### User Dashboard (Frontend)
#### [MODIFY] [api.js](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/services/api.js)
- Update `fetchDashboardSummary` and `fetchMyRentals` to accept `userId`.
- Fix `fetchItemAvailability` to use correct query parameters.

#### [MODIFY] [Dashboard.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/pages/Dashboard.jsx)
- Import `useAuth` hook.
- Pass `user.id` to `fetchDashboardSummary`.

### Admin Panel Port Standardization
#### [MODIFY] [PublicNavbar.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/components/PublicNavbar.jsx)
- Update "Shop Owner Login" link from port 5173 to 5174.

#### [MODIFY] [Sidebar.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/components/Sidebar.jsx)
- Update links targeting the admin panel from port 5173 to 5174.

#### [MODIFY] [BecomeOwner.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/pages/BecomeOwner.jsx)
- Update redirect/link to port 5174.

#### [MODIFY] [Login.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/pages/Login.jsx)
- Update port 5173 references.

## Verification Plan
- Click "Shop Owner Login" from the User Dashboard and verify it redirects to port 5174.
- Verify all links to the Admin Panel use port 5174.

