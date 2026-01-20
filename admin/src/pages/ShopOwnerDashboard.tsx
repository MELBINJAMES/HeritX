// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

interface Item {
  id: number;
  owner_id: number;
  name: string;
  category: string;
  occasion: string;
  quality: string;
  quantity: number;
  price_per_day: number;
  deposit_amount: number;
  description: string;
  image_url: string;
  is_available: number;
}

interface Order {
  order_id: number;
  item_name: string;
  renter_name: string;
  renter_email: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  // ... other fields if present in real data
}

const downloadWebReport = (shopName: string, stats: any, inventory: Item[], orders: Order[]) => {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: RAW DATA (Bookings_Data) ---
  // Only use REAL data. No mock data.
  const allRows = orders.map(o => ({
    id: `BK-${o.order_id}`,
    date: new Date().toLocaleDateString(), // ideally use o.created_at if available
    customer: o.renter_name,
    item: o.item_name,
    category: 'General', // We might need to fetch this if not in order object, but for now 'General' is fine or join with inventory
    qty: 1, // Defaulting to 1 as orders structure implies single item per row roughly
    price: 1500, // This should come from order if available
    deposit: 3000,
    start: '-',
    end: '-',
    total: 1500, // Should be real total
    payment: o.status === 'active' ? 'Paid' : 'Pending',
    delivery: 'Pickup',
    status: o.status === 'active' ? 'Approved' : (o.status === 'pending' ? 'Pending' : o.status)
  }));

  const wsRawData = XLSX.utils.json_to_sheet(allRows);

  // Rewrite cleaner approach for empty data handling:
  if (allRows.length === 0) {
    const headers = ["Booking ID", "Date", "Customer", "Item", "Category", "Quantity", "Price", "Deposit", "Start Date", "End Date", "Total Amount", "Payment Status", "Delivery Method", "Booking Status"];
    XLSX.utils.sheet_add_aoa(wsRawData, [headers], { origin: "A1" });
  } else {
    // Rename headers if needed, or rely on keys. json_to_sheet uses keys as headers by default.
    // Let's force nice headers
    XLSX.utils.sheet_add_aoa(wsRawData, [["Booking ID", "Booking Date", "Customer Name", "Item Name", "Category", "Quantity", "Price Per Day", "Deposit", "Rental Start", "Rental End", "Total Amount", "Payment Status", "Delivery Method", "Booking Status"]], { origin: "A1" });
  }

  XLSX.utils.book_append_sheet(wb, wsRawData, "Bookings_Data");


  // --- SHEET 2: PROCESSING (Calculations) ---
  // Formulas referencing Bookings_Data
  const calcData = [
    ["METRIC", "FORMULA", "VALUE"],
    ["Total Revenue (Paid)", "SUMIF", { t: 'n', f: 'SUMIF(Bookings_Data!L2:L1000, "Paid", Bookings_Data!K2:K1000)' }],
    ["Total Bookings", "COUNT", { t: 'n', f: 'COUNTA(Bookings_Data!A2:A1000)' }],
    ["Active Rentals", "COUNTIF", { t: 'n', f: 'COUNTIF(Bookings_Data!N2:N1000, "Approved")' }],
    ["Pending Requests", "COUNTIF", { t: 'n', f: 'COUNTIF(Bookings_Data!N2:N1000, "Pending")' }],
    ["Total Deposit Value", "SUM", { t: 'n', f: 'SUM(Bookings_Data!H2:H1000)' }],
    ["Avg Order Value", "AVERAGE", { t: 'n', f: 'IFERROR(AVERAGE(Bookings_Data!K2:K1000), 0)' }]
  ];

  const wsProcessing = XLSX.utils.aoa_to_sheet(calcData);
  XLSX.utils.book_append_sheet(wb, wsProcessing, "Processing");


  // --- SHEET 3: DASHBOARD (Owner Dashboard) ---
  const dashboardData = [
    ["HERITX SHOP OWNER DASHBOARD"],
    ["Shop Name:", shopName],
    ["Report Date:", new Date().toLocaleDateString()],
    [],
    ["BUSINESS OVERVIEW"],
    ["Total Revenue", { t: 'n', f: 'Processing!C2' }],
    ["Total Bookings", { t: 'n', f: 'Processing!C3' }],
    ["Active Rentals", { t: 'n', f: 'Processing!C4' }],
    ["Pending Requests", { t: 'n', f: 'Processing!C5' }],
    [],
    ["INVENTORY SNAPSHOT"],
    ["Total Items", inventory.length],
    [],
    ["*** Real-time data generated from system records ***"]
  ];

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);

  // Styling Columns
  wsDashboard['!cols'] = [{ wch: 25 }, { wch: 20 }];
  wsRawData['!cols'] = Array(14).fill({ wch: 18 });

  XLSX.utils.book_append_sheet(wb, wsDashboard, "Owner Dashboard");

  // --- SHEET 4: INVENTORY ---
  const inventoryHeaders = ['Item Name', 'Category', 'Occasion', 'Quantity', 'Price/Day (₹)', 'Deposit (₹)', 'Status', 'Description'];
  const inventoryRows = inventory.map(item => [
    item.name,
    item.category,
    item.occasion,
    item.quantity,
    item.price_per_day,
    item.deposit_amount,
    item.is_available ? 'Available' : 'Unavailable',
    item.description
  ]);

  const wsInventory = XLSX.utils.aoa_to_sheet([inventoryHeaders, ...inventoryRows]);

  // Auto-width for inventory columns
  wsInventory['!cols'] = [
    { wch: 25 }, // Name
    { wch: 15 }, // Category
    { wch: 15 }, // Occasion
    { wch: 10 }, // Qty
    { wch: 12 }, // Price
    { wch: 12 }, // Deposit
    { wch: 12 }, // Status
    { wch: 40 }  // Description
  ];

  XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory List");

  // Write file
  XLSX.writeFile(wb, `HeritX_Report_${shopName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
};

interface NewItemState {
  name: string;
  category: string;
  occasion: string;
  quality: string;
  quantity: string;
  price: string;
  deposit: string;
  description: string;
  image: File | null;
}

const ShopOwnerDashboard = () => {
  const { logout, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Protect route code
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/shop-owner/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Add Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', image: null });

  // Popup State
  const [popup, setPopup] = useState<{ open: boolean, title: string, message: string, type: 'alert' | 'confirm', onConfirm?: () => void }>({
    open: false, title: '', message: '', type: 'alert'
  });

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#64748b' }}>Restoring session...</div>
      </div>
    );
  }

  if (!user) return null; // Should redirect by useEffect, but safe return

  const triggerAlert = (title: string, message: string) => {
    setPopup({ open: true, title, message, type: 'alert' });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setPopup({ open: true, title, message, type: 'confirm', onConfirm });
  };

  const closePopup = () => setPopup({ ...popup, open: false });

  // Real Data State
  const [inventory, setInventory] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  // Settings State
  const [settingsView, setSettingsView] = useState<'menu' | 'profile' | 'policies' | 'preferences' | 'security'>('menu');
  const [settingsData, setSettingsData] = useState({
    shop_name: '', phone: '', shop_address: '', rental_terms: '', late_fee_policy: '', bank_details: '',
    operating_hours: '', default_deposit_percent: 20,
    profile_photo: '', tax_id: '', shop_description: '',
    instagram_url: '', facebook_url: '', maps_url: '',
    shop_city: '', shop_pincode: '', opening_time: '', closing_time: '', working_days: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [fullImagePreview, setFullImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost/HertiX/admin/public/api/shop_get_settings.php?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSettingsData(data);
        })
        .catch(console.error);
    }
  }, [user]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('owner_id', user?.id || '');
      // Append all text fields
      Object.keys(settingsData).forEach(key => {
        formData.append(key, (settingsData as any)[key]);
      });
      // Append file if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await fetch('http://localhost/HertiX/admin/public/api/shop_update_settings.php', {
        method: 'POST',
        // headers: { 'Content-Type': 'multipart/form-data' }, // Let browser set boundary
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        triggerAlert('Success', 'Settings updated successfully');
        if (data.profile_photo) {
          setSettingsData(prev => ({ ...prev, profile_photo: data.profile_photo }));
        }
        // setSettingsView('menu'); // Stay on page
      } else {
        triggerAlert('Error', data.message);
      }
    } catch (e) {
      triggerAlert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // ... useEffect ...

  const handleEdit = (item: Item) => {
    console.log("Edit clicked for item:", item);
    if (!item) return;

    setNewItem({
      name: item.name || '',
      category: item.category || 'Attire',
      occasion: item.occasion || 'Onam',
      quality: item.quality || 'Good',
      quantity: (item.quantity || 1).toString(),
      price: (item.price_per_day || 0).toString(),
      deposit: (item.deposit_amount || 0).toString(),
      description: item.description || '',
      image: null
    });
    setEditItemId(item.id);
    console.log("Set editItemId to:", item.id);
    setShowAddModal(true);
  };

  const handleDelete = async (itemId: number) => {
    triggerConfirm("Delete Item?", "Are you sure you want to remove this item? This action cannot be undone.", async () => {
      setLoading(true);
      closePopup(); // Close confirm modal
      try {
        const res = await fetch('http://localhost/HertiX/admin/public/api/shop_delete_item.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: itemId, owner_id: user?.id })
        });
        const data = await res.json();
        if (data.status === 'success') {
          triggerAlert('Deleted', "Item removed successfully.");
          if (user?.id) fetchRealData(user.id);
        } else {
          triggerAlert('Error', "Found error: " + data.message);
        }
      } catch (err) {
        console.error(err);
        triggerAlert('Error', "Failed to delete item.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleAddItem = async (e: any) => {
    if (e) e.preventDefault();

    if (!newItem.name || !newItem.price) {
      triggerAlert('Missing Info', "Please fill in Product Name and Price");
      return;
    }

    setLoading(true);

    if (!user || !user.id) {
      triggerAlert('Session Error', "Session expired or invalid. Please Log Out and Log In again.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('owner_id', user.id);
    formData.append('name', newItem.name);
    formData.append('category', newItem.category);
    formData.append('occasion', newItem.occasion);
    formData.append('quality', newItem.quality);
    formData.append('quantity', newItem.quantity);
    formData.append('price', newItem.price);
    formData.append('deposit', newItem.deposit);
    formData.append('description', newItem.description);

    if (newItem.image) {
      formData.append('image', newItem.image);
    }

    console.log("Submitting form. Edit Mode:", !!editItemId, "ID:", editItemId);
    const endpoint = editItemId
      ? 'http://localhost/HertiX/admin/public/api/shop_update_item.php'
      : 'http://localhost/HertiX/admin/public/api/shop_add_item.php';

    console.log("Endpoint:", endpoint);

    if (editItemId) {
      formData.append('item_id', editItemId.toString());
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.status === 'success') {
          triggerAlert('Success', editItemId ? 'Item updated successfully!' : 'Item added successfully!');
          setShowAddModal(false);
          setNewItem({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', image: null });
          setEditItemId(null);
          if (user?.id) fetchRealData(user.id);
        } else {
          triggerAlert('Error', 'Server Error: ' + data.message);
        }
      } catch (jsonErr) {
        console.error("JSON Parse Error:", jsonErr);
        console.log("Response text:", text);
        triggerAlert('System Error', "Server returned invalid JSON. Check console.");
      }

    } catch (err: any) {
      console.error("Network Error:", err);
      triggerAlert('Network Error', 'Network failure: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data on Mount
  useEffect(() => {
    console.log("Dashboard Effect: User is", user);
    if (user?.id) {
      fetchRealData(user.id);
    } else {
      console.log("User ID missing, waiting...");
      // If user is not yet available, wait a bit, then stop loading.
      // This prevents infinite loading if user exists but has no ID, or if auth fails silently.
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchRealData = async (userId: string) => {
    console.log("Fetching real data for user:", userId);
    try {
      setLoading(true);
      const API_BASE = 'http://localhost/HertiX/admin/public/api';

      const [invRes, ordRes] = await Promise.all([
        fetch(`${API_BASE}/shop_inventory.php?user_id=${userId}`).catch(e => { console.error("Inv fetch fail", e); return { json: () => [] }; }),
        fetch(`${API_BASE}/shop_orders.php?user_id=${userId}`).catch(e => { console.error("Ord fetch fail", e); return { json: () => [] }; })
      ]);

      const invData = await invRes.json();
      console.log("Inventory Data Received:", invData);

      const ordData = await ordRes.json();
      console.log("Orders Data Received:", ordData);

      setInventory(Array.isArray(invData) ? (invData as Item[]) : []);
      setOrders(Array.isArray(ordData) ? (ordData as Order[]) : []);

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setInventory([]); setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== 'cancelled' ? 1500 : 0), 0);
    const activeRentals = orders.filter(o => o.status === 'active').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    return { totalRevenue, activeRentals, pendingOrders };
  };

  const stats = calculateStats();
  const handleLogout = () => { logout(); window.location.href = 'http://localhost:3000'; };

  // Modern Skeleton
  const SkeletonLoader = () => (
    <div className="main-content">
      <div className="skeleton sk-title"></div>
      <div className="grid-layout">
        <div className="skeleton sk-card"></div>
        <div className="skeleton sk-card"></div>
        <div className="skeleton sk-card"></div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <SkeletonLoader />;

    switch (activeTab) {
      case 'inventory':
        return (
          <div className="fade-in">
            <div className="page-header">
              <div>
                <h2 className="page-title">Inventory</h2>
                <p className="page-subtitle">Manage your rental assets and availability.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Product</button>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Occasion</th>
                    <th>Qty</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!Array.isArray(inventory) || inventory.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No items found. Add your first product.</td></tr>
                  ) : (
                    inventory.map(item => {
                      if (!item) return null;
                      return (
                        <tr key={item.id || Math.random()}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                              <img
                                src={item.image_url ? `http://localhost/HertiX/user-dashboard/frontend/public/${item.image_url}` : 'https://via.placeholder.com/40'}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://via.placeholder.com/40?text=IMG';
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                          </td>
                          <td>{item.category}</td>
                          <td><span style={{ fontSize: '0.85em', color: '#64748b' }}>{item.occasion}</span></td>
                          <td>{item.quantity || 1}</td>
                          <td>₹{item.price_per_day}</td>
                          <td><span className={`badge ${item.is_available == 1 ? 'success' : 'warning'}`}>{item.is_available == 1 ? 'Active' : 'Unavailable'}</span></td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)} style={{ marginRight: 5 }}>Edit</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setViewItem(item)} style={{ marginRight: 5 }}>View</button>
                            <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-text)' }}>Remove</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {showAddModal && (
              <div
                style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.6)',
                  zIndex: 1000,
                  backdropFilter: 'blur(3px)',
                  overflowY: 'auto',
                  padding: '40px 20px',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center'
                }}
                onClick={() => { setShowAddModal(false); setEditItemId(null); }}
              >
                <div
                  className="modern-card"
                  style={{
                    width: 600, maxWidth: '95vw', padding: 0,
                    margin: 'auto',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    position: 'relative'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '20px 25px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{editItemId ? 'Edit Item' : 'Add New Item'}</h3>
                    <button onClick={() => { setShowAddModal(false); setEditItemId(null); setNewItem({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', image: null }); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
                  </div>
                  <div className="card-body" style={{ padding: 25 }}>
                    {/* Changed form to div to prevent default submit issues and use explicit onClick */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="field">
                        <span>Product Name</span>
                        <input required placeholder="e.g. Bronze Nilavilakku" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Category</span>
                          <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            style={{ padding: 12, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', width: '100%' }}>
                            <option value="Attire">Attire</option>
                            <option value="Decor">Decor</option>
                            <option value="Jewelry">Jewelry</option>
                            <option value="Art">Art</option>
                            <option value="Ritual">Ritual</option>
                          </select>
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Occasion</span>
                          <select value={newItem.occasion} onChange={e => setNewItem({ ...newItem, occasion: e.target.value })}
                            style={{ padding: 12, border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', width: '100%' }}>
                            <option value="Onam">Onam</option>
                            <option value="Vishu">Vishu</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Temple Ritual">Temple Ritual</option>
                            <option value="Classical Dance">Classical Dance</option>
                            <option value="House Warming">House Warming</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Quantity</span>
                          <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} style={{ display: 'none' }} />
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <button type="button"
                              onClick={() => {
                                const val = parseInt(newItem.quantity || '1');
                                if (val > 1) setNewItem({ ...newItem, quantity: (val - 1).toString() });
                              }}
                              style={{ border: 'none', background: '#f1f5f9', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary)' }}
                            >−</button>
                            <input
                              type="number"
                              min="1"
                              value={newItem.quantity}
                              onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                              style={{ border: 'none', textAlign: 'center', width: '100%', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                            />
                            <button type="button"
                              onClick={() => {
                                const val = parseInt(newItem.quantity || '0');
                                setNewItem({ ...newItem, quantity: (val + 1).toString() });
                              }}
                              style={{ border: 'none', background: '#f1f5f9', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary)' }}
                            >+</button>
                          </div>
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Daily Rent (₹)</span>
                          <input type="number" placeholder="500" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                        </div>
                      </div>
                      <div className="field">
                        <span>Deposit Amount (₹)</span>
                        <input type="number" placeholder="1000" value={newItem.deposit} onChange={e => setNewItem({ ...newItem, deposit: e.target.value })} />
                      </div>
                      <div className="field">
                        <span>Value Description</span>
                        <input placeholder="Short description of item..." value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                      </div>
                      <div className="field">
                        <span>Upload Image</span>
                        <input type="file" accept="image/*" onChange={e => setNewItem({ ...newItem, image: e.target.files[0] })}
                          style={{ border: 'none', padding: 0 }} />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="btn btn-primary"
                        style={{ marginTop: 10, opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : (editItemId ? 'Save Changes' : 'Publish Listing')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* View Details Modal */}
            {viewItem && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
              }}>
                <div className="modern-card" style={{ width: 450, padding: 0, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ position: 'relative', height: 250, background: '#f8fafc' }}>
                    <img
                      src={viewItem.image_url ? `http://localhost/HertiX/user-dashboard/frontend/public/${viewItem.image_url}` : 'https://via.placeholder.com/300'}
                      alt={viewItem.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/300' }}
                    />
                    <button
                      onClick={() => setViewItem(null)}
                      style={{
                        position: 'absolute', top: 15, right: 15,
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, fontSize: '1.2rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      &times;
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      padding: '20px 20px 15px', color: 'white'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{viewItem.name}</h3>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', marginTop: 8 }}>
                        {viewItem.category}
                      </span>
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: 25 }}>
                    <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Price per Day</label>
                        <div style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 700 }}>₹{viewItem.price_per_day}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Security Deposit</label>
                        <div style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 600 }}>₹{viewItem.deposit_amount}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Occasion</label>
                        <div style={{ fontSize: '1rem', color: '#334155' }}>{viewItem.occasion}</div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Available Qty</label>
                        <div style={{ fontSize: '1rem', color: '#334155' }}>{viewItem.quantity || 1} units</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Description</label>
                      <p style={{ margin: '8px 0 0', color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {viewItem.description || 'No detailed description available for this item.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );



      case 'orders':
        return (
          <div className="fade-in">
            <div className="page-header">
              <div>
                <h2 className="page-title">Rentals</h2>
                <p className="page-subtitle">Track bookings and manage returns.</p>
              </div>
              <div className="filter-bar">
                <button className="filter-pill active">All</button>
                <button className="filter-pill">Pending</button>
                <button className="filter-pill">Active</button>
              </div>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Item</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No active rentals found.</td></tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.order_id}>
                        <td style={{ fontWeight: 600 }}>#{order.order_id}</td>
                        <td>Rental</td>
                        <td>{order.item_name}</td>
                        <td>
                          <div>{order.renter_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.renter_email}</div>
                        </td>
                        <td><span className={`badge ${order.status === 'active' ? 'info' : order.status === 'pending' ? 'warning' : 'success'}`}>{order.status}</span></td>
                        <td>
                          {order.status === 'pending' && <button className="btn btn-primary btn-sm">Approve</button>}
                          {order.status === 'active' && <button className="btn btn-outline btn-sm">Track</button>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'analytics':
        const revenueData = [4500, 7200, 3100, 8900, 5600, 9200, 12500]; // Mock monthly data for demo
        const maxRevenue = Math.max(...revenueData);

        return (
          <div className="fade-in">
            <div className="page-header">
              <div>
                <h2 className="page-title">Analytics</h2>
                <p className="page-subtitle">Platform performance and revenue insights.</p>
              </div>
              <div className="filter-bar">
                <button className="filter-pill active">30 Days</button>
                <button className="filter-pill">90 Days</button>
              </div>
            </div>

            <div className="grid-layout">
              {/* Revenue Chart */}
              <div className="modern-card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header"><h3>Revenue Trends (Last 7 Days)</h3></div>
                <div className="card-body">
                  <div className="chart-container">
                    {revenueData.map((val, idx) => (
                      <div key={idx} className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ height: `${(val / maxRevenue) * 100}%` }}
                          title={`₹${val}`}
                        ></div>
                        <span className="chart-label">Day {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performing Assets */}
              <div className="modern-card">
                <div className="card-header"><h3>Top Items</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="modern-table">
                    <tbody>
                      {orders.slice(0, 5).map((o, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{o.item_name}</td>
                          <td style={{ textAlign: 'right', color: 'var(--success-text)' }}>+₹1,500</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td style={{ padding: 20, textAlign: 'center', color: '#888' }}>No data available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="fade-in">
            {settingsView === 'menu' && (
              <>
                <div className="page-header">
                  <div>
                    <h2 className="page-title">Your Account</h2>
                    <p className="page-subtitle">Manage your business profile and preferences.</p>
                  </div>
                </div>

                <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>



                  {/* Card 2: Rental Policies */}
                  <div className="modern-card"
                    onClick={() => setSettingsView('policies')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem', background: '#dcfce7', padding: 12, borderRadius: '50%' }}>📜</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Rental Policies</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Terms, deposit rules, and late fees</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Shop Preferences */}
                  <div className="modern-card"
                    onClick={() => setSettingsView('preferences')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem', background: '#f3e8ff', padding: 12, borderRadius: '50%' }}>⚙️</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Shop Preferences</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Hours, vacation mode, and defaults</p>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Security */}
                  <div className="modern-card"
                    onClick={() => triggerAlert('Info', 'To change password, please contact support or use Forgot Password on login.')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ fontSize: '2rem', background: '#fee2e2', padding: 12, borderRadius: '50%' }}>🛡️</div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Login & Security</h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Update password and account access</p>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}



            {settingsView === 'policies' && (
              <div style={{ maxWidth: 800 }}>
                <button className="btn btn-outline" onClick={() => setSettingsView('menu')} style={{ marginBottom: 20 }}>← Back to Settings</button>
                <div className="modern-card">
                  <div className="card-header"><h3>Rental Policies & Rules</h3></div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Terms of Service (shown to renters)</label>
                      <textarea style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 100 }}
                        placeholder="e.g. Items must be returned clean..."
                        value={settingsData.rental_terms} onChange={e => setSettingsData({ ...settingsData, rental_terms: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Late Fee Policy</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="e.g. ₹500 per day late"
                        value={settingsData.late_fee_policy} onChange={e => setSettingsData({ ...settingsData, late_fee_policy: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bank Details (for payouts)</label>
                      <textarea style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="Account Number, IFSC, Bank Name"
                        value={settingsData.bank_details} onChange={e => setSettingsData({ ...settingsData, bank_details: e.target.value })} />
                    </div>
                    <button className="btn btn-primary" onClick={saveSettings}>Save Policies</button>
                  </div>
                </div>
              </div>
            )}

            {settingsView === 'preferences' && (
              <div style={{ maxWidth: 800 }}>
                <button className="btn btn-outline" onClick={() => setSettingsView('menu')} style={{ marginBottom: 20 }}>← Back to Settings</button>
                <div className="modern-card">
                  <div className="card-header"><h3>Shop Preferences</h3></div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Operating Hours</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="e.g. Mon-Sat: 9 AM - 6 PM"
                        value={settingsData.operating_hours} onChange={e => setSettingsData({ ...settingsData, operating_hours: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Security Deposit (%)</label>
                      <input type="number" className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="20"
                        value={settingsData.default_deposit_percent} onChange={e => setSettingsData({ ...settingsData, default_deposit_percent: parseInt(e.target.value) || 0 })} />
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>Used to auto-calculate deposit for new items.</p>
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: 15, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 15 }}>
                      <input type="checkbox" id="vacationMode" style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                        checked={!!settingsData.vacation_mode}
                        onChange={e => setSettingsData({ ...settingsData, vacation_mode: e.target.checked ? 1 : 0 })} />
                      <div>
                        <label htmlFor="vacationMode" className="form-label" style={{ marginBottom: 0, color: 'var(--primary)', fontWeight: 600 }}>Vacation Mode</label>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Temporarily hide all your items from search results.</p>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={saveSettings}>Save Preferences</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'profile':
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const currentDays = settingsData.working_days ? settingsData.working_days.split(',') : [];

        const toggleDay = (day: string) => {
          if (currentDays.includes(day)) {
            setSettingsData({ ...settingsData, working_days: currentDays.filter(d => d !== day).join(',') });
          } else {
            setSettingsData({ ...settingsData, working_days: [...currentDays, day].join(',') });
          }
        };

        return (
          <div className="fade-in">
            <div className="page-header">
              <div>
                <h2 className="page-title">My Profile</h2>
                <p className="page-subtitle">Manage your shop details, location, and operating hours.</p>
              </div>
            </div>

            <div style={{ maxWidth: 800 }}>
              <div className="modern-card">
                <div className="card-header"><h3>🏪 Shop Information</h3></div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Profile Photo</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {settingsData.profile_photo && (
                        <img
                          src={settingsData.profile_photo}
                          alt="Profile Preview"
                          style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd', cursor: 'pointer' }}
                          onClick={() => setFullImagePreview(settingsData.profile_photo)}
                        />
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="form-input"
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setLogoFile(file);
                            setSettingsData({ ...settingsData, profile_photo: URL.createObjectURL(file) });
                          }
                        }}
                      />
                      {settingsData.profile_photo && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setSettingsData({ ...settingsData, profile_photo: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          style={{
                            padding: '10px 15px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shop Name</label>
                    <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                      value={settingsData.shop_name} onChange={e => setSettingsData({ ...settingsData, shop_name: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shop Description</label>
                    <textarea style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 60 }}
                      placeholder="Tell customers about your shop..."
                      value={settingsData.shop_description} onChange={e => setSettingsData({ ...settingsData, shop_description: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="modern-card" style={{ marginTop: 20 }}>
                <div className="card-header"><h3>📍 Location Details</h3></div>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Full Address</label>
                    <textarea style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', minHeight: 80 }}
                      value={settingsData.shop_address} onChange={e => setSettingsData({ ...settingsData, shop_address: e.target.value })} />
                  </div>

                  <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        value={settingsData.shop_city} onChange={e => setSettingsData({ ...settingsData, shop_city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        value={settingsData.shop_pincode} onChange={e => setSettingsData({ ...settingsData, shop_pincode: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Google Maps Link</label>
                    <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                      placeholder="https://maps.google.com/..."
                      value={settingsData.maps_url} onChange={e => setSettingsData({ ...settingsData, maps_url: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="modern-card" style={{ marginTop: 20 }}>
                <div className="card-header"><h3>📞 Contact Details</h3></div>
                <div className="card-body">
                  <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        value={settingsData.phone} onChange={e => setSettingsData({ ...settingsData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email (Read-only)</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', background: '#f1f5f9', cursor: 'not-allowed' }}
                        value={user?.email || 'Loading...'} disabled />
                    </div>
                  </div>
                  <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Instagram URL</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="instagram.com/yourshop"
                        value={settingsData.instagram_url} onChange={e => setSettingsData({ ...settingsData, instagram_url: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Facebook URL</label>
                      <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        placeholder="facebook.com/yourshop"
                        value={settingsData.facebook_url} onChange={e => setSettingsData({ ...settingsData, facebook_url: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modern-card" style={{ marginTop: 20 }}>
                <div className="card-header"><h3>⏰ Shop Timing</h3></div>
                <div className="card-body">
                  <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                    <div className="form-group">
                      <label className="form-label">Opening Time</label>
                      <input type="time" className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        value={settingsData.opening_time} onChange={e => setSettingsData({ ...settingsData, opening_time: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Closing Time</label>
                      <input type="time" className="form-input" style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
                        value={settingsData.closing_time} onChange={e => setSettingsData({ ...settingsData, closing_time: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Working Days</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                      {days.map(day => (
                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: currentDays.includes(day) ? '#e0f2fe' : '#f8fafc', borderRadius: 20, cursor: 'pointer', border: currentDays.includes(day) ? '1px solid #0ea5e9' : '1px solid #ddd' }}>
                          <input type="checkbox" checked={currentDays.includes(day)} onChange={() => toggleDay(day)} style={{ display: 'none' }} />
                          <span style={{ fontWeight: 500, color: currentDays.includes(day) ? '#0284c7' : '#64748b' }}>{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={saveSettings} style={{ marginTop: 10 }}>Save All Changes</button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        // Overview
        return (
          <div className="fade-in">
            <div className="page-header">
              <div>
                <h1 className="page-title">Welcome back, {settingsData.shop_name || user?.name || 'Owner'}</h1>
                <p className="page-subtitle">Here is what's happening with your store today.</p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => downloadWebReport(settingsData.shop_name || user?.name || 'My_Shop', stats, inventory, orders)}
              >
                Download Report
              </button>
            </div>

            <div className="grid-layout">
              {/* Stat Cards */}
              <div className="modern-card">
                <div className="card-header"><h3>Total Revenue</h3></div>
                <div className="card-body">
                  <span className="metric-label">This Month</span>
                  <div className="metric-big">₹{stats.totalRevenue.toLocaleString()}</div>
                </div>
              </div>

              <div className="modern-card">
                <div className="card-header"><h3>Active Requests</h3></div>
                <div className="card-body">
                  <span className="metric-label">Pending Approval</span>
                  <div className="metric-big" style={{ color: stats.pendingOrders > 0 ? 'var(--warning-text)' : 'inherit' }}>
                    {stats.pendingOrders}
                  </div>
                </div>
                <div className="card-footer">
                  <a href="#" className="link-primary" onClick={() => setActiveTab('orders')}>Review Requests &rarr;</a>
                </div>
              </div>

              <div className="modern-card">
                <div className="card-header"><h3>Inventory Status</h3></div>
                <div className="card-body">
                  <span className="metric-label">Total Assets</span>
                  <div className="metric-big">{inventory.length}</div>
                </div>
                <div className="card-footer">
                  <a href="#" className="link-primary" onClick={() => setActiveTab('inventory')}>Manage Items &rarr;</a>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 20 }}>Recent Activity</h3>
              <div className="modern-card">
                {/* Re-use table structure via orders map slice */}
                <div className="card-body" style={{ padding: 0 }}>
                  {orders.length > 0 ? (
                    <table className="modern-table">
                      <thead><tr><th>Time</th><th>Event</th><th>Status</th></tr></thead>
                      <tbody>
                        {orders.slice(0, 3).map(o => (
                          <tr key={o.order_id}>
                            <td>Today, 10:23 AM</td>
                            <td>New booking request for <strong>{o.item_name}</strong></td>
                            <td><span className="badge warning">Pending</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: 24, color: '#64748b' }}>No recent activity to show.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="modern-nav">
        <div className="nav-top">
          <div className="brand-logo">
            <span style={{ fontSize: '1.5rem' }}>🏛️</span> HeritX
            <span className="brand-badge">Seller</span>
          </div>
          <div className="nav-actions">
            <div className="user-profile" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {settingsData.profile_photo ? (
                <img
                  key={settingsData.profile_photo} // Force re-render on change
                  src={settingsData.profile_photo.startsWith('blob:')
                    ? settingsData.profile_photo
                    : `${settingsData.profile_photo}?t=${new Date().getTime()}`}
                  alt="Profile"
                  style={{ width: 35, height: 35, borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                  onError={(e) => console.log('Image Load Error:', settingsData.profile_photo)}
                />
              ) : (
                <div className="avatar-circle">{user?.name ? user.name.charAt(0) : 'U'}</div>
              )}
              <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{settingsData.shop_name || user?.name || 'User'}</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.2rem', padding: 8, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: darkMode ? '#fbbf24' : '#64748b'
              }}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="logout-btn">Sign Out</button>
          </div>
        </div>
        <div className="nav-tabs">
          <button onClick={() => setActiveTab('overview')} className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>Overview</button>
          <button onClick={() => setActiveTab('inventory')} className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}>Inventory</button>
          <button onClick={() => setActiveTab('orders')} className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}>Rentals</button>
          <button onClick={() => setActiveTab('analytics')} className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}>Analytics</button>
          <button onClick={() => setActiveTab('settings')} className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}>Settings</button>
        </div>
      </nav>

      <main className="main-content">
        {renderContent()}
      </main>

      {/* Global Custom Popup */}
      {popup.open && (
        <div className="fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div className="modern-card" style={{ width: 400, maxWidth: '90%' }}>
            <div className="card-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h3 style={{ color: popup.type === 'confirm' ? 'var(--danger-text)' : 'var(--primary)', fontSize: '1.25rem' }}>
                {popup.title}
              </h3>
            </div>
            <div className="card-body" style={{ paddingTop: 10, paddingBottom: 30 }}>
              <p style={{ color: 'var(--secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                {popup.message}
              </p>
            </div>
            <div className="card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', background: 'transparent' }}>
              {popup.type === 'confirm' ? (
                <>
                  <button className="btn btn-outline" onClick={closePopup}>Cancel</button>
                  <button className="btn btn-primary" style={{ background: 'var(--danger-text)' }} onClick={() => { if (popup.onConfirm) popup.onConfirm(); }}>Confirm</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={closePopup}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {fullImagePreview && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' }}
          onClick={() => setFullImagePreview(null)}
        >
          <img
            src={fullImagePreview}
            alt="Full Size Preview"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', cursor: 'default' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setFullImagePreview(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopOwnerDashboard;
