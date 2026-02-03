# Admin Panel Implementation Plan

## Goal
Enhance `AdminDashboard` to include Shop Verification, Category Management, and Audit Logs, and ensure robust Admin Authentication.

## User Review Required
> [!IMPORTANT]
> Admin login relies on the hardcoded `admin@heritx.com` credential in `login.php`. This is retained as per requirements.

## Proposed Changes

### Backend (PHP)
#### [MODIFY] [shop_add_item.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/shop_add_item.php)
- Update input validation to include: `quantity` (positive int), `deposit_amount` (>= daily_rent), `item_condition` (New/Good/Used), `description` (min 10 chars).
- Update INSERT query to store these new fields.

#### [MODIFY] [shop_add_item.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/shop_add_item.php)
- Add optional `dos` and `donts` fields handling.

#### [MODIFY] [shop_update_item.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/shop_update_item.php)
- Add optional `dos` and `donts` fields handling.

#### [NEW] [add_dos_donts_columns.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/add_dos_donts_columns.php)
- Migration: Add `dos` (TEXT) and `donts` (TEXT) columns to `items`.

### Frontend (React)
#### [MODIFY] [ShopOwnerDashboard.tsx](file:///c:/xampp/htdocs/HertiX/admin/src/pages/ShopOwnerDashboard.tsx)
- Add TextAreas for Do's and Don'ts in Add Item form.

#### [MODIFY] [ItemDetails.jsx](file:///c:/xampp/htdocs/HertiX/user-dashboard/frontend/src/pages/ItemDetails.jsx)
- Display Do's and Don'ts section if data exists.

#### [MODIFY] [ShopOwnerDashboard.tsx](file:///c:/xampp/htdocs/HertiX/admin/src/pages/ShopOwnerDashboard.tsx)
- **Add Item Form**:
    - Add fields: `Quantity`, `Deposit Amount`, `Condition` (Select), `Description`.
    - Implement rigorous validation:
        - Name > 3 chars
        - Prices > 0
        - Deposit >= Rent
        - Description > 10 chars
    - Show inline validation errors.
    - Submit only when valid.
    - feedback: "Item submitted successfully (Pending Review)" if approval enabled.
#### [NEW] [create_admin_tables.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/create_admin_tables.php)
- Create `categories` table (id, name, type [category/occasion]).
- Create `audit_logs` table (id, action, details, created_at).

#### [MODIFY] [admin_dashboard_data.php](file:///c:/xampp/htdocs/HertiX/admin/public/api/admin_dashboard_data.php)
- Handle `action = 'pending_owners'`
- Handle `action = 'approve_owner'`
- Handle `action = 'reject_owner'`
- Handle `action = 'toggle_shop_status'`
- Handle `action = 'get_categories'`, `add_category`, `delete_category`
- Handle `action = 'get_logs'`
- Log actions to `audit_logs` table.

### Frontend (React)
#### [MODIFY] [AdminDashboard.tsx](file:///c:/xampp/htdocs/HertiX/admin/src/pages/AdminDashboard.tsx)
- **Navigation**: Add tabs for 'Verification', 'Categories', 'Logs'.
- **Verification Tab**: Table of `pending_owners`. Approve/Reject buttons.
- **Shop Management Tab**: Update existing 'owners' tab. Show Status (Active/Unified). Add Toggle Status button.
- **Categories Tab**: List of Categories & Occasions. Form to Add New. Delete button.
- **Logs Tab**: Read-only table of audit logs.

#### [MODIFY] [Login.tsx](file:///c:/xampp/htdocs/HertiX/admin/src/pages/Login.tsx)
- Ensure Admin redirection logic works (already seems present but verification needed).
