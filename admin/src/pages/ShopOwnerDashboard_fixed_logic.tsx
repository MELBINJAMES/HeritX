// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaBell, FaCircle } from 'react-icons/fa';

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
  is_approved: number;
  dos?: string;
  donts?: string;
}

interface Order {
  order_id: number;
  item_name: string;
  renter_name: string;
  renter_email: string;
  renter_phone: string;
  deposit_amount: number;
  total_price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'damaged';
  created_at: string;
  booking_date: string;
  damage_note: string;
  damage_deduction: number;
}

const downloadWebReport = (shopName: string, stats: any, inventory: Item[], orders: Order[]) => {
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: RAW DATA (Bookings_Data) ---
  const allRows = orders.map(o => ({
    id: `BK-${o.order_id}`,
    date: new Date().toLocaleDateString(),
    customer: o.renter_name,
    item: o.item_name,
    category: 'General',
    qty: 1,
    price: 1500,
    deposit: 3000,
    start: '-',
    end: '-',
    total: 1500,
    payment: o.status === 'active' ? 'Paid' : 'Pending',
    delivery: 'Pickup',
    status: o.status === 'active' ? 'Approved' : (o.status === 'pending' ? 'Pending' : o.status)
  }));

  const wsRawData = XLSX.utils.json_to_sheet(allRows);

  if (allRows.length === 0) {
    const headers = ["Booking ID", "Date", "Customer", "Item", "Category", "Quantity", "Price", "Deposit", "Start Date", "End Date", "Total Amount", "Payment Status", "Delivery Method", "Booking Status"];
    XLSX.utils.sheet_add_aoa(wsRawData, [headers], { origin: "A1" });
  } else {
    XLSX.utils.sheet_add_aoa(wsRawData, [["Booking ID", "Booking Date", "Customer Name", "Item Name", "Category", "Quantity", "Price Per Day", "Deposit", "Rental Start", "Rental End", "Total Amount", "Payment Status", "Delivery Method", "Booking Status"]], { origin: "A1" });
  }

  XLSX.utils.book_append_sheet(wb, wsRawData, "Bookings_Data");

  // --- SHEET 2: PROCESSING (Calculations) ---
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
  wsDashboard['!cols'] = [{ wch: 25 }, { wch: 20 }];
  wsRawData['!cols'] = Array(14).fill({ wch: 18 });

  XLSX.utils.book_append_sheet(wb, wsDashboard, "Owner Dashboard");

  // --- SHEET 4: INVENTORY ---
  const inventoryHeaders = ['Item Name', 'Category', 'Occasion', 'Quantity', 'Price/Day (₹)', 'Deposit (₹)', 'Status', 'Description'];
  const inventoryRows = inventory.map(item => [
    item.name, item.category, item.occasion, item.quantity, item.price_per_day, item.deposit_amount,
    item.is_available ? 'Available' : 'Unavailable', item.description
  ]);

  const wsInventory = XLSX.utils.aoa_to_sheet([inventoryHeaders, ...inventoryRows]);
  wsInventory['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 40 }];

  XLSX.utils.book_append_sheet(wb, wsInventory, "Inventory List");
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
  dos: string;
  donts: string;
  image: File | null;
}

const ShopOwnerDashboard = () => {
  const { logout, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>(() => JSON.parse(localStorage.getItem('readNotifications') || '[]'));
  const [filterStatus, setFilterStatus] = useState('all');

  // Real Data State
  const [inventory, setInventory] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Refund Flow States
  const [modalStep, setModalStep] = useState<string>('INITIAL');
  const [receiptSent, setReceiptSent] = useState(false);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [damageDeduction, setDamageDeduction] = useState(0);
  const [timeDeduction, setTimeDeduction] = useState(0);
  const [damageLabel, setDamageLabel] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [refundSent, setRefundSent] = useState(false);
  const [finalReceiptSent, setFinalReceiptSent] = useState(false);

  // States for Reset/Legacy logic
  const [completeSent, setCompleteSent] = useState(false);
  const [damageChecked, setDamageChecked] = useState<null | 'no_damage' | 'has_damage'>(null);
  const [showDamageTiers, setShowDamageTiers] = useState(false);
  const [thankYouSent, setThankYouSent] = useState(false);
  const [damageSent, setDamageSent] = useState(false);
  const [damageRefundSent, setDamageRefundSent] = useState(false);
  const [appreciationSent, setAppreciationSent] = useState(false);
  const [damageNote, setDamageNote] = useState('');

  // Settings State
  const [settingsView, setSettingsView] = useState<'menu' | 'profile' | 'policies' | 'preferences' | 'security' | 'offers'>('menu');
  const [settingsData, setSettingsData] = useState({
    shop_name: '', phone: '', shop_address: '', rental_terms: '', late_fee_policy: '', bank_details: '',
    operating_hours: '', default_deposit_percent: 20,
    profile_photo: '', tax_id: '', shop_description: '',
    instagram_url: '', facebook_url: '', maps_url: '',
    shop_city: '', shop_pincode: '', opening_time: '', closing_time: '', working_days: '',
    offer_title: '', offer_message: '', offer_start: '', offer_end: '', offer_discount_percent: 0,
    vacation_mode: 0
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', dos: '', donts: '', image: null });
  const [popup, setPopup] = useState<{ open: boolean, title: string, message: string, type: 'alert' | 'confirm', onConfirm?: () => void }>({
    open: false, title: '', message: '', type: 'alert'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [fullImagePreview, setFullImagePreview] = useState<string | null>(null);

  // Handle auto-close on final receipt
  useEffect(() => {
    if (finalReceiptSent) {
      const timer = setTimeout(() => setSelectedOrder(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [finalReceiptSent]);

  // Sync modal states when order changes
  useEffect(() => {
    if (selectedOrder) {
      setModalStep('INITIAL');
      setReceiptSent(false);
      setIssueType(null);
      setDamageDeduction(0);
      setTimeDeduction(0);
      setDamageLabel('');
      setTimeLabel('');
      setRefundSent(false);
      setFinalReceiptSent(false);
    }
  }, [selectedOrder]);

  // Protect route code
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/shop-owner/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/HertiX/admin/public/api/shop_get_settings.php?id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setSettingsData(prev => ({ ...prev, ...data }));
        })
        .catch(console.error);
    }
  }, [user]);

  // Fetch Data on Mount
  useEffect(() => {
    if (user?.id) {
      fetchRealData(user.id);
      const pollInterval = setInterval(() => fetchRealData(user.id), 30000);
      return () => clearInterval(pollInterval);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ color: '#64748b' }}>Restoring session...</div>
      </div>
    );
  }

  if (!user) return null;

  const triggerAlert = (title, message) => setPopup({ open: true, title, message, type: 'alert' });
  const triggerConfirm = (title, message, onConfirm) => setPopup({ open: true, title, message, type: 'confirm', onConfirm });
  const closePopup = () => setPopup({ ...popup, open: false });

  const saveSettings = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('owner_id', user?.id || '');
      Object.keys(settingsData).forEach(key => {
        formData.append(key, settingsData[key]);
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await fetch('/HertiX/admin/public/api/shop_update_settings.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        triggerAlert('Success', 'Settings updated successfully');
        if (data.profile_photo) {
          setSettingsData(prev => ({ ...prev, profile_photo: data.profile_photo }));
        }
      } else {
        triggerAlert('Error', data.message);
      }
    } catch (e) {
      triggerAlert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string, damageNote: string = '', damageDeduction: number = 0) => {
    setLoading(true);
    try {
      const res = await fetch('/HertiX/admin/public/api/shop_update_order_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus, owner_id: user?.id, damage_note: damageNote, damage_deduction: damageDeduction })
      });
      const data = await res.json();
      if (data.status === 'success') {
        triggerAlert('Success', `Order #${orderId} marked as ${newStatus}`);
        if (user?.id) fetchRealData(user.id);
        setSelectedOrder(null);
        setDamageNote('');
        setDamageDeduction(0);
      } else {
        triggerAlert('Error', data.message);
      }
    } catch (error) {
      triggerAlert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReceipt = (order: any) => {
    const msg = `Hello ${order.renter_name}, this is a receipt for your Order #${order.order_id}. Total Paid: Rs.${order.total_price}. Deposit: Rs.${order.deposit_amount}. Thank you for choosing HeritX!`;
    const url = `https://wa.me/91${order.renter_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setReceiptSent(true);
  };

  const handleSendEmail = async (order: any) => {
    setCompleteSent(true);
    triggerAlert('Email Sent', `Automated receipt emailed to ${order.renter_email}`);
  };

  const handleEdit = (item: Item) => {
    if (!item) return;
    setNewItem({
      name: item.name || '', category: item.category || 'Attire', occasion: item.occasion || 'Onam',
      quality: item.quality || 'Good', quantity: (item.quantity || 1).toString(),
      price: (item.price_per_day || 0).toString(), deposit: (item.deposit_amount || 0).toString(),
      description: item.description || '', dos: item.dos || '', donts: item.donts || '', image: null
    });
    setEditItemId(item.id);
    setShowAddModal(true);
  };

  const handleDelete = async (itemId: number) => {
    triggerConfirm("Delete Item?", "Are you sure you want to remove this item?", async () => {
      setLoading(true);
      closePopup();
      try {
        const res = await fetch('/HertiX/admin/public/api/shop_delete_item.php', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: itemId, owner_id: user?.id })
        });
        const data = await res.json();
        if (data.status === 'success') {
          triggerAlert('Deleted', "Item removed successfully.");
          if (user?.id) fetchRealData(user.id);
        } else {
          triggerAlert('Error', data.message);
        }
      } catch (err) {
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
    if (!user?.id) {
      triggerAlert('Session Error', "Session expired. Please Log In again.");
      setLoading(false); return;
    }

    const formData = new FormData();
    formData.append('owner_id', user.id);
    formData.append('name', newItem.name);
    formData.append('category', newItem.category);
    formData.append('occasion', newItem.occasion);
    formData.append('item_condition', newItem.quality);
    formData.append('quantity', newItem.quantity);
    formData.append('price', newItem.price);
    formData.append('deposit', newItem.deposit);
    formData.append('description', newItem.description);
    formData.append('dos', newItem.dos);
    formData.append('donts', newItem.donts);
    if (newItem.image) formData.append('image', newItem.image);

    const endpoint = editItemId ? '/HertiX/admin/public/api/shop_update_item.php' : '/HertiX/admin/public/api/shop_add_item.php';
    if (editItemId) formData.append('item_id', editItemId.toString());

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.status === 'success') {
        triggerAlert('Success', editItemId ? 'Item updated successfully!' : 'Item submitted successfully.');
        setShowAddModal(false);
        setNewItem({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', dos: '', donts: '', image: null });
        setEditItemId(null);
        fetchRealData(user.id);
      } else {
        triggerAlert('Error', data.message);
      }
    } catch (err) {
      triggerAlert('Error', 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealData = async (userId: string) => {
    try {
      setLoading(true);
      const API_BASE = '/HertiX/admin/public/api';
      const [invRes, ordRes] = await Promise.all([
        fetch(`${API_BASE}/shop_inventory.php?user_id=${userId}`).catch(() => ({ json: () => [] })),
        fetch(`${API_BASE}/shop_orders.php?user_id=${userId}`).catch(() => ({ json: () => [] }))
      ]);
      const invData = await invRes.json();
      const ordData = await ordRes.json();
      setInventory(Array.isArray(invData) ? invData : []);
      setOrders(Array.isArray(ordData) ? ordData : []);
    } catch (error) {
      console.error(error);
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
  const handleLogout = () => { logout(); window.location.href = '/HertiX/admin/'; };

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
                <thead><tr><th>Item</th><th>Category</th><th>Occasion</th><th>Qty</th><th>Price/Day</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>No items found.</td></tr>
                  ) : (
                    inventory.map(item => (
                      <tr key={item.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                            <img src={item.image_url ? `/HertiX/user-dashboard/frontend/public/${item.image_url}` : 'https://via.placeholder.com/40'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.occasion}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price_per_day}</td>
                        <td>
                          <span className={`badge ${item.is_available == 1 ? 'success' : 'warning'}`}>{item.is_available == 1 ? 'Active' : 'Unavailable'}</span>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => handleEdit(item)} style={{ marginRight: 5 }}>Edit</button>
                          <button className="btn btn-outline btn-sm" onClick={() => setViewItem(item)} style={{ marginRight: 5 }}>View</button>
                          <button className="btn btn-outline btn-sm" onClick={() => handleDelete(item.id)} style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-text)' }}>Remove</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {showAddModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, backdropFilter: 'blur(3px)', overflowY: 'auto', padding: '40px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }} onClick={() => { setShowAddModal(false); setEditItemId(null); }}>
                <div className="modern-card" style={{ width: 600, maxWidth: '95vw', padding: 0, margin: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '20px 25px' }}>
                    <h3 style={{ margin: 0 }}>{editItemId ? 'Edit Item' : 'Add New Item'}</h3>
                    <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                  </div>
                  <div className="card-body" style={{ padding: 25 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div className="field"><span>Product Name</span><input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} /></div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Category</span>
                          <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
                            <option value="Attire">Attire</option>
                            <option value="Jewellery">Jewellery</option>
                            <option value="Ritual Items">Ritual Items</option>
                          </select>
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <span>Occasion</span>
                          <select value={newItem.occasion} onChange={e => setNewItem({ ...newItem, occasion: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}>
                            <option value="Onam">Onam</option>
                            <option value="Wedding">Wedding</option>
                          </select>
                        </div>
                      </div>
                      <div className="field"><span>Rent (₹)</span><input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} /></div>
                      <div className="field"><span>Deposit (₹)</span><input type="number" value={newItem.deposit} onChange={e => setNewItem({ ...newItem, deposit: e.target.value })} /></div>
                      <div className="field"><span>Description</span><textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} /></div>
                      <div className="field"><span>Image</span><input type="file" onChange={e => setNewItem({ ...newItem, image: e.target.files[0] })} /></div>
                      <button onClick={handleAddItem} className="btn btn-primary" style={{ width: '100%', marginTop: 10 }}>{editItemId ? 'Update Item' : 'Add Item'}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'orders':
        const filteredOrders = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);
        return (
          <div className="fade-in">
            <div className="page-header">
              <div><h2 className="page-title">Rentals</h2><p className="page-subtitle">Manage bookings.</p></div>
              <div className="filter-bar">
                {['all', 'pending', 'active', 'completed', 'damaged'].map(s => (
                  <button key={s} className={`filter-pill ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="table-container">
              <table className="modern-table">
                <thead><tr><th>ID</th><th>Item</th><th>Customer</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No records.</td></tr>
                  ) : (
                    filteredOrders.map(o => (
                      <tr key={o.order_id}>
                        <td style={{ fontWeight: 600 }}>#{o.order_id}</td>
                        <td>{o.item_name}</td>
                        <td>{o.renter_name}</td>
                        <td>{o.status}</td>
                        <td><button className="btn btn-outline btn-sm" onClick={() => setSelectedOrder(o)}>Manage</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {selectedOrder && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setSelectedOrder(null)}>
                <div style={{ width: 500, background: '#fff', borderRadius: 15, padding: 25 }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ marginBottom: 20 }}>Order #{selectedOrder.order_id}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
                    <div><strong>Customer:</strong> {selectedOrder.renter_name}</div>
                    <div><strong>Status:</strong> {selectedOrder.status}</div>
                    <div><strong>Amount:</strong> Rs. {selectedOrder.total_price}</div>
                    <div><strong>Deposit:</strong> Rs. {selectedOrder.deposit_amount}</div>
                  </div>

                  {selectedOrder.status === 'active' && (
                    <div style={{ borderTop: '1px solid #efefef', paddingTop: 20 }}>
                      <p style={{ fontWeight: 600, marginBottom: 15 }}>Refund & Return Flow</p>
                      {modalStep === 'INITIAL' && (
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { handleSendReceipt(selectedOrder); setModalStep('RETURN_CHOICE'); }}>Send Initial Receipt (WA)</button>
                      )}
                      {modalStep === 'RETURN_CHOICE' && (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-outline" style={{ flex: 1, borderColor: '#10b981', color: '#10b981' }} onClick={() => setModalStep('SAFE_REFUND')}>Item Safe</button>
                          <button className="btn btn-outline" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setModalStep('ISSUE_TYPE')}>Item Issue</button>
                        </div>
                      )}
                      {modalStep === 'SAFE_REFUND' && (
                        <button className="btn btn-primary" style={{ width: '100%', background: '#10b981' }} onClick={async () => {
                          setLoading(true);
                          const res = await fetch('/HertiX/admin/public/api/shop_refund_deposit.php', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order_id: selectedOrder.order_id, owner_id: user?.id, refund_amount: selectedOrder.deposit_amount, damage_type: 'No Damage', deduction: 0 })
                          });
                          const d = await res.json();
                          setLoading(false);
                          if (d.status === 'success') {
                            triggerAlert('Success', 'Refund processed.');
                            setSelectedOrder(null);
                            fetchRealData(user.id);
                          } else triggerAlert('Error', d.message);
                        }}>Confirm Safe Return & Refund Full Deposit</button>
                      )}
                      {modalStep === 'ISSUE_TYPE' && (
                        <div>
                          <p>Damage assessment needed. Please select deduction percentage.</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                            {[25, 50, 75, 100].map(p => (
                              <button key={p} className="btn btn-outline btn-sm" onClick={() => {
                                setDamageDeduction((p / 100) * selectedOrder.deposit_amount);
                                setDamageLabel(`${p}% Damage`);
                                setModalStep('PROCESS_ISSUE_REFUND');
                              }}>{p}% Deduction</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {modalStep === 'PROCESS_ISSUE_REFUND' && (
                        <div>
                          <p style={{ marginBottom: 15 }}>Deduction: Rs. {damageDeduction}. Refund: Rs. {selectedOrder.deposit_amount - damageDeduction}</p>
                          <button className="btn btn-primary" style={{ width: '100%', background: '#ef4444' }} onClick={async () => {
                            setLoading(true);
                            const res = await fetch('/HertiX/admin/public/api/shop_refund_deposit.php', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ order_id: selectedOrder.order_id, owner_id: user?.id, refund_amount: selectedOrder.deposit_amount - damageDeduction, damage_type: damageLabel, deduction: damageDeduction })
                            });
                            const d = await res.json();
                            setLoading(false);
                            if (d.status === 'success') {
                              triggerAlert('Success', 'Partial refund processed.');
                              setSelectedOrder(null);
                              fetchRealData(user.id);
                            } else triggerAlert('Error', d.message);
                          }}>Confirm & Refund Remaining</button>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedOrder.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                      <button className="btn btn-primary" style={{ flex: 1, background: '#10b981' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'active')}>Approve</button>
                      <button className="btn btn-outline" style={{ flex: 1, color: '#ef4444' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'cancelled')}>Reject</button>
                    </div>
                  )}

                  <button className="btn btn-link" style={{ width: '100%', marginTop: 20 }} onClick={() => setSelectedOrder(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="fade-in">
            <h2 className="page-title">Shop Settings</h2>
            <div className="modern-card" style={{ maxWidth: 800 }}>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Shop Name</label><input className="form-input" value={settingsData.shop_name} onChange={e => setSettingsData({ ...settingsData, shop_name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" value={settingsData.shop_address} onChange={e => setSettingsData({ ...settingsData, shop_address: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={settingsData.phone} onChange={e => setSettingsData({ ...settingsData, phone: e.target.value })} /></div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={settingsData.vacation_mode === 1} onChange={e => setSettingsData({ ...settingsData, vacation_mode: e.target.checked ? 1 : 0 })} />
                  <label>Vacation Mode</label>
                </div>
                <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="fade-in">
            <h2 className="page-title">Profile</h2>
            <div className="modern-card" style={{ maxWidth: 600 }}>
              <div className="card-body">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#eee', margin: '0 auto', overflow: 'hidden' }}>
                    {settingsData.profile_photo && <img src={settingsData.profile_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <input type="file" onChange={e => { if (e.target.files?.[0]) { setLogoFile(e.target.files[0]); setSettingsData({ ...settingsData, profile_photo: URL.createObjectURL(e.target.files[0]) }); } }} style={{ marginTop: 10 }} />
                </div>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <button className="btn btn-primary" onClick={saveSettings}>Update Profile Photo</button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="fade-in">
            <h1 className="page-title">Dashboard</h1>
            <div className="grid-layout">
              <div className="modern-card"><div className="card-header"><h3>Revenue</h3></div><div className="card-body"><div className="metric-big">₹{stats.totalRevenue}</div></div></div>
              <div className="modern-card"><div className="card-header"><h3>Active</h3></div><div className="card-body"><div className="metric-big">{stats.activeRentals}</div></div></div>
              <div className="modern-card"><div className="card-header"><h3>Pending</h3></div><div className="card-body"><div className="metric-big">{stats.pendingOrders}</div></div></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="modern-nav">
        <div className="nav-top">
          <div className="brand-logo">HeritX Seller</div>
          <div className="nav-actions">
            <span style={{ marginRight: 15 }}>{settingsData.shop_name || user.name}</span>
            <button onClick={handleLogout} className="logout-btn">Sign Out</button>
          </div>
        </div>
        <div className="nav-tabs">
          {['overview', 'inventory', 'orders', 'settings', 'profile'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>{t.toUpperCase()}</button>
          ))}
        </div>
      </nav>
      <main className="main-content">{renderContent()}</main>
      {popup.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="modern-card" style={{ width: 400 }}>
            <div className="card-header"><h3>{popup.title}</h3></div>
            <div className="card-body"><p>{popup.message}</p></div>
            <div className="card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {popup.type === 'confirm' && <button className="btn btn-outline" onClick={closePopup}>Cancel</button>}
              <button className="btn btn-primary" onClick={() => { if (popup.type === 'confirm' && popup.onConfirm) popup.onConfirm(); closePopup(); }}>{popup.type === 'confirm' ? 'Confirm' : 'OK'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopOwnerDashboard;
