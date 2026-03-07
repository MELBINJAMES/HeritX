import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
// Remvoed unused Navigate
import './AdminDashboard.css'; // Import Premium Styles

const AdminDashboard = () => {
    // ... interfaces ...
    interface User {
        id: number;
        name: string;
        email: string;
        created_at: string;
        role: string;
        is_approved?: number;
        shop_address?: string;
        shop_city?: string;
        shop_phone?: string;
        shop_proof?: string;
    }

    interface Stats {
        users: number;
        owners: number;
        items: number;
        rentals: number;
        pending_owners?: number;
        pending_items?: number;
    }

    interface Item {
        id: number;
        name: string;
        category: string;
        price_per_day: number;
        image_url: string;
        owner_name: string;
        is_approved?: number;
    }

    interface Category {
        id: number;
        name: string;
        type: 'category' | 'occasion';
    }

    interface Log {
        id: number;
        action: string;
        details: string;
        created_at: string;
    }

    const { user, logout, loading: authLoading } = useAuth();

    // 1. All Hooks MUST be at the top
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState<Stats>({ users: 0, owners: 0, items: 0, rentals: 0 });
    const [usersList, setUsersList] = useState<User[]>([]);
    const [ownersList, setOwnersList] = useState<User[]>([]);
    const [itemsList, setItemsList] = useState<Item[]>([]); // All items
    const [pendingOwners, setPendingOwners] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true); // Now used
    const [searchTerm, setSearchTerm] = useState('');
    const [newCat, setNewCat] = useState({ name: '', type: 'category' });
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState<User | null>(null); // For Verification Modal

    // New Modal States
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, title: string, message: string, onConfirm: () => void } | null>(null);
    const [successModal, setSuccessModal] = useState<{ show: boolean, message: string } | null>(null);

    // 2. Helper functions (safe to define here)
    // ... (rest of the file until handleAction)

    // 2. Helper functions (safe to define here)
    const getFilteredData = (data: any[], fields: string[]) => {
        if (!searchTerm || !Array.isArray(data)) return data || [];
        return data.filter(item =>
            fields.some(field => {
                const val = item[field];
                return val && (typeof val === 'string' || typeof val === 'number') && String(val).toLowerCase().includes(searchTerm.toLowerCase());
            })
        );
    };

    // 3. Data Fetching (Defines function + Effect) - MUST be before conditional returns
    const fetchData = async () => {
        // Guard against calling state setters if component unmounted or auth invalid (though tough to check unmount here without ref)
        // We rely on the effect dependency to only call this when appropriate
        setLoading(true);
        try {
            const API = 'http://localhost/HertiX/admin/public/api/admin_dashboard_data.php';

            if (activeTab === 'dashboard') {
                const res = await fetch(`${API}?action=stats`);
                const data = await res.json();
                if (data.status === 'success') setStats(data.stats);
            }
            else if (activeTab === 'users') {
                const res = await fetch(`${API}?action=users`);
                const data = await res.json();
                if (data.status === 'success') setUsersList(data.users);
            }
            else if (activeTab === 'owners') {
                const res = await fetch(`${API}?action=owners`);
                const data = await res.json();
                if (data.status === 'success') setOwnersList(data.owners);
            }
            else if (activeTab === 'items') {
                const res = await fetch(`${API}?action=all_items`);
                const data = await res.json();
                if (data.status === 'success') setItemsList(data.items);
            }
            else if (activeTab === 'pending_owners') {
                const res = await fetch(`${API}?action=pending_owners`);
                const data = await res.json();
                if (data.status === 'success') setPendingOwners(data.owners);
            }
            else if (activeTab === 'categories') {
                const res = await fetch(`${API}?action=get_categories`);
                const data = await res.json();
                if (data.status === 'success') setCategories(data.categories);
            }
            else if (activeTab === 'logs') {
                const res = await fetch(`${API}?action=get_logs`);
                const data = await res.json();
                if (data.status === 'success') setLogs(data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if we are authenticated and not loading auth
        if (!authLoading && user?.role === 'admin') {
            fetchData();
        }
    }, [activeTab, authLoading, user]);

    useEffect(() => {
        if (successModal?.show) {
            const timer = setTimeout(() => setSuccessModal(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [successModal]);

    // 4. Conditional Returns (MUST come AFTER all hooks)
    if (authLoading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f6f9', color: '#6b7280' }}>Verifying Access...</div>;
    }

    if (!user) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', color: '#1e293b' }}>
                <h2>Session Expired</h2>
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>Please log in to access the Admin Console.</p>
                <button onClick={() => window.location.href = '/shop-owner/login'} style={{ padding: '0.75rem 1.5rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Go to Login
                </button>
            </div>
        );
    }

    if (user.role !== 'admin' && user.role !== 'Shop Owner') {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fef2f2', color: '#991b1b' }}>
                <h2 style={{ fontSize: '2rem' }}>🚫 Access Denied</h2>
                <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>You are logged in as <strong>{user.role}</strong>.</p>
                <p style={{ marginBottom: '2rem', color: '#b91c1c' }}>This area is restricted to Administrators and Shop Owners only.</p>
                <button onClick={logout} style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Logout & Switch Account
                </button>
            </div>
        );
    }

    const handleAction = async (action: string, id: number | null = null, payload: any = null) => {
        const executeAction = async () => {
            try {
                await fetch('http://localhost/HertiX/admin/public/api/admin_dashboard_data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, id, ...payload })
                });
                fetchData();
                setConfirmModal(null);
                setSuccessModal({ show: true, message: "Action completed successfully" });
            } catch (error) {
                setSuccessModal({ show: true, message: "Action failed" });
            }
        };

        if (action === 'toggle_shop_status') {
            const shop = ownersList.find(o => o.id === id);
            const msg = shop?.is_approved
                ? "Are you sure you want to SUSPEND this shop? Their items will be hidden from users, but all data will be preserved. You can restore them anytime."
                : "This will ACTIVATE the shop and make their items visible to the public again. Proceed?";

            setConfirmModal({
                show: true,
                title: shop?.is_approved ? 'Suspend Shop Account' : 'Activate Shop Account',
                message: msg,
                onConfirm: executeAction
            });
        } else if (action.includes('delete') || action.includes('reject')) {
            setConfirmModal({
                show: true,
                title: 'Confirm Deletion',
                message: 'Are you sure? This action is irreversible.',
                onConfirm: executeAction
            });
        } else {
            executeAction();
        }
    };





    const filteredPendingOwners = getFilteredData(pendingOwners, ['name', 'email']);
    const filteredOwners = getFilteredData(ownersList, ['name', 'email']);
    const filteredUsers = getFilteredData(usersList, ['name', 'email']);
    const filteredItems = getFilteredData(itemsList, ['name', 'category', 'owner_name']); // Filter for all items
    const filteredCategories = getFilteredData(categories, ['name']);
    const filteredLogs = getFilteredData(logs, ['action', 'details']);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Data...</div>; // Use loading state

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a href="http://localhost:3001" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit' }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.1, color: '#1e293b' }}>HeritX</span>
                            <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#64748b', fontWeight: 600 }}>Wear the Legacy</span>
                        </a>
                        <span style={{ fontWeight: 400, opacity: 0.7, fontSize: '1.1rem', color: '#1e293b' }}>ADMIN</span>
                    </div>
                </div>

                <nav className="nav-menu">
                    {[
                        ['dashboard', 'Dashboard', '📊'],
                        ['pending_owners', 'Verify Shops', '🛡️'],
                        ['owners', 'All Shops', '🏪'],
                        ['users', 'Customers', '👥'],
                        ['items', 'Invt. Items', '📦'], // New Tab
                        ['categories', 'Catalog Config', '🏷️'],
                        ['logs', 'System Logs', '📜']
                    ].map(([key, label, icon]) => (
                        <button
                            key={key}
                            onClick={() => { setActiveTab(key); setSearchTerm(''); }}
                            className={`nav-item ${activeTab === key ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="logout-container">
                    <button onClick={logout} className="logout-btn">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Layout Column */}
            <main className="admin-main">
                <header className="top-header">
                    {/* Only show search bar on lists, hide on main dashboard */}
                    {activeTab === 'dashboard' ? (
                        <div style={{ width: '400px' }}></div> /* Placeholder to maintain header flex layout */
                    ) : (
                        <div className="search-bar">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={`Search ${activeTab.replace(/_/g, ' ')}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn-search-trigger" title="Search">
                                🔍
                            </button>
                        </div>
                    )}

                    <div className="header-right">
                        <div style={{ position: 'relative' }}>
                            <span
                                style={{ fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                🔔
                                {((stats.pending_owners || 0)) > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: 'red',
                                        borderRadius: '50%',
                                        width: '10px',
                                        height: '10px',
                                        display: 'block',
                                        border: '2px solid white' // Optional: adds a nice separation
                                    }}>
                                    </span>
                                )}
                            </span>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '30px',
                                    right: 0,
                                    width: '250px',
                                    background: 'white',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#475569' }}>
                                        Notifications
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {/* Pending Shops */}
                                        {(stats.pending_owners || 0) > 0 ? (
                                            <div
                                                onClick={() => { setActiveTab('pending_owners'); setShowNotifications(false); }}
                                                style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '0.9rem' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                            >
                                                <div style={{ fontWeight: 500, color: '#2563eb' }}>🛡️ Verify Shops</div>
                                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{stats.pending_owners} new shop request(s)</div>
                                            </div>
                                        ) : null}

                                        {/* Empty State */}
                                        {((stats.pending_owners || 0) === 0) && (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin-profile">
                            <div className="admin-avatar">AD</div>
                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Administrator</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="content-scroll">
                    <header style={{ marginBottom: '2rem' }}>
                        <h1 className="page-title" style={{ margin: 0, textTransform: 'capitalize' }}>
                            {activeTab.replace(/_/g, ' ')}
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Manage your {activeTab.replace(/_/g, ' ')} here</p>
                    </header>

                    {/* CONTENT INJECTION BELOW */}

                    {/* Dashboard Stats */}
                    {activeTab === 'dashboard' && (
                        <div className="stats-grid">
                            <StatCard
                                label="Total Users"
                                value={stats.users}
                                color="blue"
                                icon="👥"
                                onClick={() => setActiveTab('users')}
                                index={1}
                            />
                            <StatCard
                                label="Shop Owners"
                                value={stats.owners}
                                color="purple"
                                icon="🏪"
                                onClick={() => setActiveTab('owners')}
                                index={2}
                            />
                            <StatCard
                                label="Verify Shops"
                                value={stats.pending_owners || 0}
                                color="red"
                                icon="🛡️"
                                onClick={() => setActiveTab('pending_owners')}
                                index={3}
                            />
                            <StatCard label="Active Rentals" value={stats.rentals} color="orange" icon="🔄" index={4} />
                        </div>
                    )}

                    {/* Pending Owners Table */}
                    {activeTab === 'pending_owners' && (
                        <div className="table-container">
                            <div className="table-header">
                                <h3>Pending Requests</h3>
                            </div>
                            <div className="table-scroll-wrapper">
                                <table className="modern-table">
                                    <colgroup>
                                        <col style={{ width: '25%' }} />
                                        <col style={{ width: '30%' }} />
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '25%' }} />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Shop Name</th>
                                            <th>Email</th>
                                            <th>Date</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPendingOwners.map(o => (
                                            <tr key={o.id}>
                                                <td><strong>{o.name}</strong></td>
                                                <td>{o.email}</td>
                                                <td>{o.created_at}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn-action btn-primary btn-small"
                                                            onClick={() => setSelectedOwner(o)}
                                                            style={{ background: '#3b82f6', color: 'white' }}
                                                        >
                                                            Verify Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredPendingOwners.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>{searchTerm ? 'No matches found' : 'No pending requests'}</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Categories Management - Redesigned Grid */}
                    {activeTab === 'categories' && (
                        <div className="categories-management-grid">

                            {/* Left Column: Fixed Add Form */}
                            <div className="table-container add-new-category-card" style={{ position: 'sticky', top: '20px' }}>
                                <div className="table-header" style={{ padding: '0 0 1.5rem 0', border: 'none' }}>
                                    <h3>Add New Category</h3>
                                </div>
                                <div className="form-group-column">
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Name</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. Traditional Saree"
                                        value={newCat.name}
                                        onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                                        style={{ margin: 0 }}
                                    />

                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginTop: '0.5rem' }}>Type</label>
                                    <select
                                        className="form-input"
                                        value={newCat.type}
                                        onChange={e => setNewCat({ ...newCat, type: e.target.value as any })}
                                        style={{ margin: 0 }}
                                    >
                                        <option value="category">Category (Item Type)</option>
                                        <option value="occasion">Occasion (Event)</option>
                                    </select>

                                    <button
                                        className="btn-action btn-primary btn-full-width"
                                        style={{ marginTop: '1rem', justifyContent: 'center' }}
                                        onClick={() => {
                                            if (!newCat.name.trim()) return;
                                            handleAction('add_category', null, newCat);
                                            setNewCat({ name: '', type: 'category' });
                                        }}
                                    >
                                        + Create Category
                                    </button>
                                </div>

                                <div style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Presets</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {['Kanchipuram Sarees', 'Kerala Kasavu', 'Temple Jewelry', 'Kathakali Props', 'Brass Lamps', 'Onam Specials'].map(preset => (
                                            <button
                                                key={preset}
                                                onClick={() => setNewCat({ name: preset, type: 'category' })}
                                                style={{
                                                    padding: '4px 10px', fontSize: '0.75rem', background: '#f1f5f9',
                                                    border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer',
                                                    color: '#475569', transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = '#c7d2fe' }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                                            >
                                                {preset} +
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Animated Card Grid */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Active Catalog ({filteredCategories.length})</h3>
                                    </div>
                                </div>

                                {filteredCategories.length === 0 ? (
                                    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                        <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📭</div>
                                        <h3 style={{ color: '#475569', margin: '0 0 0.5rem 0' }}>No Categories Found</h3>
                                        <p style={{ color: '#94a3b8', margin: 0 }}>Create a new category using the form on the left.</p>
                                    </div>
                                ) : (
                                    <div className="categories-card-grid">
                                        {filteredCategories.map((c, index) => (
                                            <div
                                                key={c.id}
                                                className="category-card"
                                                style={{ animationDelay: `${index * 0.04}s` }} /* Staggered waterfall entrance */
                                            >
                                                <div>
                                                    <h4 className="category-card-title">{c.name}</h4>
                                                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>ID: #{c.id}</p>
                                                </div>
                                                <div className="category-card-footer">
                                                    <span className={`status-badge ${c.type === 'category' ? 'status-active' : 'status-disabled'}`}>
                                                        {c.type === 'category' ? '📦 Category' : '🎭 Occasion'}
                                                    </span>
                                                    <button
                                                        className="category-card-delete"
                                                        title="Delete Category"
                                                        onClick={(e) => { e.stopPropagation(); handleAction('delete_category', c.id); }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {/* Logs */}
                    {activeTab === 'logs' && (
                        <div className="table-container">
                            <div className="table-header"><h3>Audit Trail</h3></div>
                            <table className="modern-table">
                                <colgroup>
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '20%' }} />
                                    <col style={{ width: '60%' }} />
                                </colgroup>
                                <thead><tr><th>Time</th><th>Action</th><th>Details</th></tr></thead>
                                <tbody>
                                    {filteredLogs.map(l => (
                                        <tr key={l.id}>
                                            <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{l.created_at}</td>
                                            <td style={{ fontWeight: '600', color: '#0f172a' }}>{l.action}</td>
                                            <td style={{ color: '#334155' }}>{l.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Reusing Table Components with new styling */}
                    {activeTab === 'users' && <UserTable data={filteredUsers} onDelete={(id: any) => handleAction('delete_user', id)} />}
                    {activeTab === 'items' && <AllItemsTable data={filteredItems} onDelete={(id: any) => handleAction('delete_item', id)} />}
                    {activeTab === 'owners' && <OwnerTable data={filteredOwners} onToggle={(id: any) => handleAction('toggle_shop_status', id)} />}
                </div>

                {/* Verification Modal */}
                {selectedOwner && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{
                            background: 'white', padding: '2rem', borderRadius: '12px',
                            maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
                        }}>
                            <h2 style={{ marginTop: 0 }}>Verify Shop: {selectedOwner.name}</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Owner Email</label>
                                    <div style={{ fontWeight: 500 }}>{selectedOwner.email}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Contact</label>
                                    <div style={{ fontWeight: 500 }}>{selectedOwner.shop_phone || 'N/A'}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Address</label>
                                    <div style={{ fontWeight: 500 }}>
                                        {selectedOwner.shop_address}, {selectedOwner.shop_city}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Proof Document</label>
                                <div style={{
                                    border: '1px solid #e2e8f0', borderRadius: '8px',
                                    padding: '10px', marginTop: '5px', background: '#f8fafc',
                                    textAlign: 'center'
                                }}>
                                    {selectedOwner.shop_proof ? (
                                        selectedOwner.shop_proof.endsWith('.pdf') ? (
                                            <a href={`http://localhost/HertiX/admin/public/${selectedOwner.shop_proof}`} target="_blank" style={{ color: '#2563eb' }}>
                                                📄 View PDF Document
                                            </a>
                                        ) : (
                                            <img
                                                src={`http://localhost/HertiX/admin/public/${selectedOwner.shop_proof}`}
                                                alt="Proof"
                                                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }}
                                            />
                                        )
                                    ) : (
                                        <span style={{ color: '#ef4444' }}>No proof uploaded</span>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <button onClick={() => setSelectedOwner(null)} style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button className="btn-action btn-reject" onClick={() => { handleAction('reject_owner', selectedOwner.id); setSelectedOwner(null); }}>
                                    Reject
                                </button>
                                <button className="btn-action btn-approve" onClick={() => { handleAction('approve_owner', selectedOwner.id); setSelectedOwner(null); }}>
                                    Approve & Activate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Confirmation Modal */}
                {confirmModal && confirmModal.show && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 3000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            background: 'white', padding: '2rem', borderRadius: '16px',
                            maxWidth: '450px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.25rem' }}>{confirmModal.title}</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.5', margin: '0 0 2rem 0' }}>{confirmModal.message}</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    style={{ padding: '0.6rem 1.2rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    style={{ padding: '0.6rem 1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                                >
                                    Confirm Action
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Notification Modal */}
                {successModal && successModal.show && (
                    <div style={{
                        position: 'fixed', top: '20px', right: '20px',
                        background: '#0f172a', color: 'white', padding: '1rem 1.5rem',
                        borderRadius: '12px', zIndex: 4000, display: 'flex', alignItems: 'center',
                        gap: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>✅</span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{successModal.message}</div>
                        <button
                            onClick={() => setSuccessModal(null)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0 0 10px' }}
                        >
                            ×
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

/* Sub-components updated to use CSS classes */
const UserTable = ({ data, onDelete }: any) => (
    <div className="table-container">
        <table className="modern-table">
            <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>{data.map((u: any) => (
                <tr key={u.id}>
                    <td><strong>{u.name}</strong></td><td>{u.email}</td>
                    <td><button className="btn-action btn-reject" onClick={() => onDelete(u.id)}>Delete</button></td>
                </tr>
            ))}</tbody>
        </table>
    </div>
);

const AllItemsTable = ({ data, onDelete }: any) => (
    <div className="table-container">
        <table className="modern-table">
            <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Owner</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{data.map((i: any) => (
                <tr key={i.id}>
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={`http://localhost:3001/HertiX/${i.image_url}`} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                            <span style={{ fontWeight: 600 }}>{i.name}</span>
                        </div>
                    </td>
                    <td>{i.category}</td>
                    <td>₹{i.price_per_day}</td>
                    <td>{i.owner_name}</td>
                    <td>
                        <span className={`status-badge ${i.is_approved == 1 ? 'status-active' : 'status-disabled'}`}>
                            {i.is_approved == 1 ? 'Active' : 'Pending'}
                        </span>
                    </td>
                    <td><button className="btn-action btn-reject" onClick={() => onDelete(i.id)}>Delete</button></td>
                </tr>
            ))}</tbody>
        </table>
    </div>
);

const OwnerTable = ({ data, onToggle }: any) => {
    const defaultSubject = encodeURIComponent("Important: Regarding your HeritX Shop");
    const defaultBody = encodeURIComponent("Dear Shop Owner,\r\n\r\nI am contacting you from HeritX Administration regarding your shop account.\r\n\r\n[Please type your message here]\r\n\r\nRegards,\r\nHeritX Team");

    return (
        <div className="table-container">
            <table className="modern-table">
                <thead>
                    <tr>
                        <th>Shop Name</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Management Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u: any) => (
                        <tr key={u.id}>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                                <span className={`status-badge ${u.is_approved ? 'status-active' : 'status-disabled'}`}>
                                    {u.is_approved ? 'Active' : 'Suspended'}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="action-buttons-group" style={{ justifyContent: 'flex-end' }}>
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${u.email}&su=${defaultSubject}&body=${defaultBody}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-action btn-primary btn-small"
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', background: '#ea4335', color: 'white' }}
                                    >
                                        📩 Gmail
                                    </a>
                                    <button
                                        onClick={() => onToggle(u.id)}
                                        className={`btn-action btn-small ${u.is_approved ? 'btn-reject' : 'btn-approve'}`}
                                        title={u.is_approved ? 'Suspend Account' : 'Restore Account'}
                                    >
                                        {u.is_approved ? '🚫 Suspend' : '✅ Restore'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No shops found</td></tr>}
                </tbody>
            </table>
        </div>
    );
};



const StatCard = ({ label, value, color: _color, icon, onClick, index = 0 }: any) => {
    // Generate some dynamic colors based on the label for a unique design
    const getColors = () => {
        switch (_color) {
            case 'blue': return { bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', text: '#1e3a8a', iconBg: '#bfdbfe' };
            case 'purple': return { bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', text: '#581c87', iconBg: '#e9d5ff' };
            case 'red': return { bg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', text: '#991b1b', iconBg: '#fecaca' };
            case 'green': return { bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', text: '#166534', iconBg: '#bbf7d0' };
            case 'orange': return { bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', text: '#9a3412', iconBg: '#fed7aa' };
            default: return { bg: '#ffffff', text: '#1e293b', iconBg: '#f1f5f9' };
        }
    };
    const colors = getColors();

    return (
        <div
            className="stat-card"
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                background: colors.bg,
                animationDelay: `${index * 0.1}s`,
                border: '1px solid rgba(255,255,255,0.5)'
            }}
        >
            <div className="stat-header">
                <div>
                    <span className="stat-label" style={{ color: colors.text, opacity: 0.8 }}>{label}</span>
                    <div className="stat-value" style={{ color: colors.text }}>{value}</div>
                </div>
                <span className="stat-icon-wrap" style={{ background: colors.iconBg, color: colors.text, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {icon}
                </span>
            </div>
            <div className="stat-trend" style={{
                background: onClick ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)',
                color: colors.text,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.8)',
                transition: 'all 0.2s'
            }}>
                <span style={{ fontWeight: 600 }}>{onClick ? 'View Details →' : '↑ 12% vs last month'}</span>
            </div>
            {/* Glossy overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', borderRadius: '16px 16px 0 0' }}></div>
        </div>
    );
};

export default AdminDashboard;
