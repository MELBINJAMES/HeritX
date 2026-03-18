// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaBell, FaCircle, FaWhatsapp, FaBoxes, FaChartLine, FaWallet, FaClock, FaCalendarAlt, FaUserEdit, FaCog, FaShieldAlt, FaTrash, FaCheckCircle, FaTimesCircle, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

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
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  booking_date: string;
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
  dos: string;
  donts: string;
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
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', dos: '', donts: '', image: null });
  // Map quality to item_condition for backend
  const itemCondition = newItem.quality; // Reusing quality field in state as 'item_condition' for now or rename it. Let's keep state simple but map on submit.

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

  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>(() => JSON.parse(localStorage.getItem('readNotifications') || '[]'));

  // Real Data State
  const [inventory, setInventory] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Refund Flow States
  const [modalStep, setModalStep] = useState<string>('RETURN_CHOICE');

  const [receiptSent, setReceiptSent] = useState(false);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [damageDeduction, setDamageDeduction] = useState(0);
  const [timeDeduction, setTimeDeduction] = useState(0);
  const [damageLabel, setDamageLabel] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [refundSent, setRefundSent] = useState(false);
  const [finalReceiptSent, setFinalReceiptSent] = useState(false);
  const [refundResult, setRefundResult] = useState<{ status: string, method: string, refund_id: string, amount: number } | null>(null);
  const [isRefundSimulating, setIsRefundSimulating] = useState(false);
  const [refundStep, setRefundStep] = useState<'SELECTION' | 'PROCESSING' | 'SUCCESS'>('PROCESSING');

  // Post-payment receipt state
  const [ownerPaymentSuccess, setOwnerPaymentSuccess] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    order: any;
  } | null>(null);

  // Inject Razorpay Spinner CSS
  useEffect(() => {
    const styleId = 'razorpay-spinner-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes rzp-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .rzp-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(51, 149, 255, 0.2);
          border-top: 4px solid #3395FF;
          border-radius: 50%;
          animation: rzp-spin 1s linear infinite;
        }

        /* Gold Coin Animation */
        @keyframes coin-fly {
          0% { transform: translateX(-150px) translateY(50px) rotate(0deg) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          70% { transform: translateX(50px) translateY(-20px) rotate(360deg) scale(1.2); }
          100% { transform: translateX(110px) translateY(5px) rotate(720deg) scale(0.8); opacity: 0; }
        }
        .coin-animation-container {
          position: relative;
          width: 300px;
          height: 120px;
          margin: 0 auto;
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gold-coin {
          position: absolute;
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(255, 140, 0, 0.4), inset 0 0 10px rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 24px;
          z-index: 2;
          animation: coin-fly 2.5s infinite ease-in-out;
        }
        .slot-line {
          position: absolute;
          right: 30px;
          width: 8px;
          height: 60px;
          background: #e2e8f0;
          border-radius: 10px;
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1);
        }
        .glow-effect {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(51, 149, 255, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // States for Reset/Legacy logic
  const [completeSent, setCompleteSent] = useState(false);
  const [damageChecked, setDamageChecked] = useState<null | 'no_damage' | 'has_damage'>(null);
  const [showDamageTiers, setShowDamageTiers] = useState(false);
  const [thankYouSent, setThankYouSent] = useState(false);
  const [damageSent, setDamageSent] = useState(false);
  const [damageRefundSent, setDamageRefundSent] = useState(false);
  const [appreciationSent, setAppreciationSent] = useState(false);
  const [damageNote, setDamageNote] = useState('');

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
      setModalStep('RETURN_CHOICE');
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [fullImagePreview, setFullImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/HertiX/admin/public/api/shop_get_settings.php?id=${user.id}`)
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

      const res = await fetch('/HertiX/admin/public/api/shop_update_settings.php', {
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

  // ─── Real Razorpay Payment for Owner Dashboard ───────────────────────────
  const openOwnerRazorpay = async (amount: number, onSuccess?: () => void) => {
    if (!amount || amount <= 0) {
      triggerAlert('Invalid Amount', 'Payment amount must be greater than ₹0.');
      return;
    }

    // Ensure Razorpay SDK is loaded
    if (!(window as any).Razorpay) {
      triggerAlert('Payment Error', 'Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    try {
      // Step 1: Create a real Razorpay order via the admin backend API
      const res = await fetch('/HertiX/admin/public/api/payment_create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();

      if (data.status !== 'success') {
        triggerAlert('Payment Error', data.message || 'Could not initiate payment. Please try again.');
        return;
      }

      // Step 2: Open the real Razorpay checkout popup
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: 'INR',
        name: 'HeritX Rentals',
        description: 'Refund / Owner Payment',
        order_id: data.order_id,
        handler: function (response: any) {
          // Auto-send email receipt silently
          fetch('/HertiX/admin/public/api/send_receipt_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order: selectedOrder,
              payment_id: response.razorpay_payment_id,
              amount
            })
          }).catch(() => {/* silent fail */});

          // Show the post-payment receipt panel
          setOwnerPaymentSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount,
            order: selectedOrder
          });

          // Close the order modal
          if (onSuccess) onSuccess();
        },
        prefill: {
          name: user?.name || 'Shop Owner',
          email: user?.email || 'owner@heritx.com',
          contact: user?.phone || ''
        },
        theme: { color: '#3395FF' },
        modal: {
          ondismiss: function () {
            console.log('Razorpay modal dismissed by user');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        triggerAlert('Payment Failed', response.error.description || 'Payment was not completed.');
      });
      rzp.open();

    } catch (err: any) {
      console.error('Owner Razorpay Error:', err);
      triggerAlert('Payment Error', 'Something went wrong. Please try again.');
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

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
      dos: item.dos || '',
      donts: item.donts || '',
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
        const res = await fetch('/HertiX/admin/public/api/shop_delete_item.php', {
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

    // Validation Logic
    if (newItem.name.length < 3) { triggerAlert('Validation Error', "Product Name must be at least 3 characters."); setLoading(false); return; }
    if (/\d/.test(newItem.name)) { triggerAlert('Validation Error', "Product Name should not contain numbers."); setLoading(false); return; }
    if (parseInt(newItem.quantity) < 1) { triggerAlert('Validation Error', "Quantity must be at least 1."); setLoading(false); return; }
    if (parseFloat(newItem.price) <= 0) { triggerAlert('Validation Error', "Daily Rent must be a positive number."); setLoading(false); return; }
    if (parseFloat(newItem.deposit) < parseFloat(newItem.price)) { triggerAlert('Validation Error', "Deposit must be greater than or equal to Daily Rent."); setLoading(false); return; }
    if (newItem.description.length < 10) { triggerAlert('Validation Error', "Description must be at least 10 characters."); setLoading(false); return; }
    if (/\d/.test(newItem.description)) { triggerAlert('Validation Error', "Description should not contain numbers."); setLoading(false); return; }
    if (!newItem.image && !editItemId) { triggerAlert('Validation Error', "Please upload an image."); setLoading(false); return; }

    const formData = new FormData();
    formData.append('owner_id', user.id);
    formData.append('name', newItem.name);
    formData.append('category', newItem.category);
    formData.append('occasion', newItem.occasion);
    formData.append('item_condition', newItem.quality); // Using quality state for item_condition
    formData.append('quantity', newItem.quantity);
    formData.append('price', newItem.price);
    formData.append('deposit', newItem.deposit);
    formData.append('deposit', newItem.deposit);
    formData.append('description', newItem.description);
    formData.append('dos', newItem.dos);
    formData.append('donts', newItem.donts);

    if (newItem.image) {
      formData.append('image', newItem.image);
    }

    console.log("Submitting form. Edit Mode:", !!editItemId, "ID:", editItemId);
    const endpoint = editItemId
      ? '/HertiX/admin/public/api/shop_update_item.php'
      : '/HertiX/admin/public/api/shop_add_item.php';

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
          triggerAlert('Success', editItemId ? 'Item updated successfully!' : 'Item submitted successfully. It is now Pending Review.');
          setShowAddModal(false);
          setNewItem({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', dos: '', donts: '', image: null });
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
      const API_BASE = '/HertiX/admin/public/api';

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
    const totalRevenue = orders.reduce((acc, order) => {
      // Only count paid/completed/active/confirmed orders towards revenue
      if (['active', 'confirmed', 'completed'].includes(order.status)) {
        // Subtract deposit for revenue calculation if you only want the rental fee
        return acc + (parseFloat(String(order.total_price || 0)) - parseFloat(String(order.deposit_amount || 0)));
      }
      return acc;
    }, 0);
    const activeRentals = orders.filter(o => o.status === 'active').length;
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    return { totalRevenue, activeRentals, pendingOrders };
  };

  const stats = calculateStats();
  const handleLogout = () => { logout(); window.location.href = '/HertiX/'; };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (selectedOrder || isRefundSimulating || popup.open || fullImagePreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedOrder, isRefundSimulating, popup.open, fullImagePreview]);

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
              <div style={{ background: '#fff', borderRadius: '24px', padding: '0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item Details</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Occasion</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price/Day</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!Array.isArray(inventory) || inventory.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>No items found. Add your first product.</td></tr>
                      ) : (
                        inventory.map(item => {
                          if (!item) return null;
                          return (
                            <tr key={item.id || Math.random()} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px' }}>
                                <div style={{ width: 44, height: 44, background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                  <img
                                    src={item.image_url ? `/HertiX/${item.image_url}` : 'https://via.placeholder.com/44?text=📦'}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = 'https://via.placeholder.com/44?text=📦';
                                    }}
                                  />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>ID: #{item.id}</div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{item.category}</span></td>
                              <td style={{ padding: '16px 24px' }}><span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{item.occasion}</span></td>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{item.quantity || 1}</span>
                                  {parseInt(String(item.quantity || 1)) < 3 && (
                                    <span style={{
                                      fontSize: '0.65rem', background: '#fee2e2', color: '#dc2626',
                                      padding: '2px 6px', borderRadius: '4px',
                                      fontWeight: 800, border: '1px solid #fca5a5', textTransform: 'uppercase'
                                    }}>
                                      Low
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>₹{item.price_per_day}</td>
                              <td style={{ padding: '16px 24px' }}>
                                {item.is_approved == 0 ? (
                                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</span>
                                ) : (
                                  <span style={{ background: item.is_available == 1 ? '#dcfce7' : '#f1f5f9', color: item.is_available == 1 ? '#16a34a' : '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {item.is_available == 1 ? 'Active' : 'Hidden'}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => handleEdit(item)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3b82f6', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }} title="Edit Item"><FaUserEdit size={14} /></button>
                                  <button onClick={() => setViewItem(item)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'translateY(0)'; }} title="Quick View"><FaInfoCircle size={14} /></button>
                                  <button onClick={() => handleDelete(item.id)} style={{ background: '#fee2e2', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'translateY(0)'; }} title="Remove Item"><FaTrash size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        );



      case 'orders':
        const filteredOrders = orders.filter(order => {
          if (filterStatus === 'all') return true;
          if (filterStatus === 'active') return order.status === 'active' || order.status === 'confirmed';
          if (filterStatus === 'pending') return order.status === 'pending' || order.status === 'confirmed';
          return order.status === filterStatus;
        });

        return (
          <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '20px' }}>
              <div>
                <h2 className="page-title">Rentals Management</h2>
                <p className="page-subtitle">Track bookings, manage handovers and verify returns.</p>
              </div>
              <div className="modern-segment-control">
                <button
                  className={`segment-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </button>
                <button
                  className={`segment-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                  {orders.filter(o => o.status === 'pending').length > 0 && (
                    <span className="count-dot warning"></span>
                  )}
                </button>
                <button
                  className={`segment-btn ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Item</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No {filterStatus !== 'all' ? filterStatus : ''} rentals found.</td></tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.order_id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>#{order.order_id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                              <img src={`/HertiX/${order.item_image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/40?text=📦'; }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{order.item_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{order.total_price} Total</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                              {order.renter_name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{order.renter_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.renter_phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${(order.status === 'active' || order.status === 'completed' || order.status === 'confirmed') ? 'success' :
                            order.status === 'pending' ? 'warning' : 'info'
                            }`} style={{ padding: '6px 12px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" style={{ background: 'var(--accent)', color: 'white', borderRadius: '12px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: 'none', transition: 'all 0.2s' }} onClick={() => {
                            setSelectedOrder(order);
                            setModalStep('RETURN_CHOICE');
                          }}>
                            <FaInfoCircle size={14} /> Open
                          </button>
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
        // Calculate Revenue for Last 7 Days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const revenueData = last7Days.map(date => {
          return orders
            .filter(o => ['active', 'confirmed', 'completed'].includes(o.status) && (o.created_at || o.booking_date).startsWith(date))
            .reduce((sum, o) => sum + (parseFloat(String(o.total_price || 0)) - parseFloat(String(o.deposit_amount || 0))), 0);
        });

        const maxRevenue = Math.max(...revenueData, 100); // Prevent div by zero

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
                          <td style={{ textAlign: 'right', color: 'var(--success-text)' }}>+₹{parseFloat(String(o.total_price || 0)) - parseFloat(String(o.deposit_amount || 0))}</td>
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
                    <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaCog style={{ color: 'var(--accent)' }} /> Account Settings
                    </h2>
                    <p className="page-subtitle" style={{ marginLeft: '34px' }}>Manage your business profile and preferences.</p>
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
            <div className="page-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>👋</span>
                  Welcome back, {settingsData.shop_name || user?.name || 'Owner'}
                </h1>
                <p className="page-subtitle" style={{ marginLeft: '45px' }}>Here is what's happening with your store today.</p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => downloadWebReport(settingsData.shop_name || user?.name || 'My_Shop', stats, inventory, orders)}
              >
                Download Report
              </button>
            </div>

            <div className="grid-layout" style={{ gap: '24px' }}>
              {/* Stat Cards */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '8px', letterSpacing: '-1px' }}>₹{stats.totalRevenue.toLocaleString()}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px', marginTop: '12px', fontWeight: 700 }}>
                      <span style={{ fontSize: '0.9rem' }}>↑</span> 12% vs last month
                    </div>
                  </div>
                  <div style={{ background: '#ecfdf5', color: '#10b981', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
                    <FaWallet />
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Requests</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: stats.pendingOrders > 0 ? '#b45309' : '#0f172a', marginTop: '8px', letterSpacing: '-1px' }}>
                      {stats.pendingOrders}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '4px 8px', borderRadius: '6px', marginTop: '12px', fontWeight: 700 }}>
                      Action required soon
                    </div>
                  </div>
                  <div style={{ background: '#fffbeb', color: '#f59e0b', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)' }}>
                    <FaClock />
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inventory Status</span>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '8px', letterSpacing: '-1px' }}>{inventory.length}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#0369a1', background: '#e0f2fe', padding: '4px 8px', borderRadius: '6px', marginTop: '12px', fontWeight: 700 }}>
                      {inventory.filter(i => i.stock > 0).length} Items in stock
                    </div>
                  </div>
                  <div style={{ background: '#eff6ff', color: '#3b82f6', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}>
                    <FaBoxes />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: '#0f172a', letterSpacing: '-0.3px' }}>Recent Activity</h3>
              <div style={{ background: '#fff', borderRadius: '24px', padding: '0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {orders.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                          <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                          <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</th>
                          <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Event</th>
                          <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o, idx) => (
                          <tr key={o.order_id} style={{ borderBottom: idx < orders.slice(0, 5).length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>#{o.order_id}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{new Date(o.created_at || o.booking_date).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{new Date(o.created_at || o.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📦</div>
                                <div style={{ fontSize: '0.9rem' }}>
                                  {o.status === 'confirmed' ? (
                                    <span>Payment for <strong style={{ color: '#0f172a' }}>{o.item_name}</strong></span>
                                  ) : o.status === 'pending' ? (
                                    <span>Request for <strong style={{ color: '#0f172a' }}>{o.item_name}</strong></span>
                                  ) : (
                                    <span>Update for <strong style={{ color: '#0f172a' }}>{o.item_name}</strong></span>
                                  )}
                                  <span style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>by {o.renter_name}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                                background: o.status === 'active' ? '#e0f2fe' : o.status === 'pending' ? '#fef3c7' : o.status === 'confirmed' ? '#dcfce7' : '#dcfce7',
                                color: o.status === 'active' ? '#0369a1' : o.status === 'pending' ? '#b45309' : o.status === 'confirmed' ? '#16a34a' : '#16a34a',
                                padding: '4px 10px'
                              }}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '2rem' }}>📋</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>No recent activity to show.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="modern-nav" style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        margin: '0 24px 24px 24px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.3s ease'
      }}>
        <div className="nav-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Modern back button — icon only */}
            <button
              onClick={() => window.location.href = 'http://localhost:3000'}
              title="Back to Marketplace"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                fontSize: '1.1rem',
                fontWeight: 700,
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              ←
            </button>

            {/* HeritX Brand — same as Login page */}
            <div
              onClick={() => window.location.href = '/HertiX/'}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}
            >
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Georgia, serif', letterSpacing: '1px', lineHeight: 1.1, color: '#1e293b' }}>HeritX</span>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Wear the Legacy</span>
            </div>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer',
                  fontSize: '1.1rem', width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', position: 'relative', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                title="Notifications"
              >
                <FaBell />
                {orders.filter(o => (o.status === 'pending' || o.status === 'confirmed') && !readNotifications.includes(o.order_id)).length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444',
                    color: 'white', fontSize: '0.6rem', fontWeight: 'bold', width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                    border: '2px solid white'
                  }}>
                    {orders.filter(o => (o.status === 'pending' || o.status === 'confirmed') && !readNotifications.includes(o.order_id)).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', top: 50, right: 0, width: 340, background: '#fff',
                  borderRadius: '20px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Notifications</h4>
                    {orders.filter(o => (o.status === 'pending' || o.status === 'confirmed') && !readNotifications.includes(o.order_id)).length > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600, padding: '4px 8px', background: '#eff6ff', borderRadius: '6px' }} onClick={() => {
                        const allPendingIds = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').map(o => o.order_id);
                        const newRead = [...new Set([...readNotifications, ...allPendingIds])];
                        setReadNotifications(newRead);
                        localStorage.setItem('readNotifications', JSON.stringify(newRead));
                      }}>Mark all read</span>
                    )}
                  </div>
                  <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {(() => {
                      const notifOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
                      if (notifOrders.length === 0) {
                        return <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}><div style={{ fontSize: '2rem' }}>📭</div>No new notifications</div>;
                      }

                      return notifOrders.map(order => (
                        <div key={order.order_id} style={{
                          padding: '16px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                          background: readNotifications.includes(order.order_id) ? '#fff' : '#f0f9ff',
                          transition: 'background 0.2s',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = readNotifications.includes(order.order_id) ? '#fff' : '#f0f9ff'}
                        >
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} onClick={() => {
                            if (!readNotifications.includes(order.order_id)) {
                              const newRead = [...readNotifications, order.order_id];
                              setReadNotifications(newRead);
                              localStorage.setItem('readNotifications', JSON.stringify(newRead));
                            }
                            setActiveTab('orders');
                            setSelectedOrder(order);
                            setShowNotifications(false);
                          }}>
                            {!readNotifications.includes(order.order_id) ? (
                              <FaCircle style={{ color: '#3b82f6', fontSize: 10, flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: 10, flexShrink: 0 }} />
                            )}
                            <div>
                              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.4 }}>
                                New rental {order.status === 'confirmed' ? 'confirmed' : 'request'} for <strong style={{ color: '#0f172a' }}>{order.item_name}</strong>
                              </p>
                              <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{new Date(order.created_at || order.booking_date).toLocaleString()}</p>
                            </div>
                          </div>

                          {(order.status === 'confirmed' || order.status === 'pending') && (
                            <button style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)' }} onClick={(e) => {
                              e.stopPropagation(); // prevent modal opening

                              // --- Detailed Booking Receipt ---
                              const rentAmount = parseFloat(String(order.total_price || 0)) - parseFloat(String(order.deposit_amount || 0));
                              const text = `🧾 *Rental Booking Receipt - HeritX*\n\n` +
                                `*Order ID:* #${order.order_id}\n` +
                                `*Item:* ${order.item_name}\n\n` +
                                `--- Payment Breakdown ---\n` +
                                `*Daily Rental Fee:* ₹${rentAmount}\n` +
                                `*Security Deposit:* ₹${order.deposit_amount}\n` +
                                `----------------------------\n` +
                                `*Total Paid:* ₹${order.total_price}\n\n` +
                                `✅ *Payment Status:* Verified via Razorpay\n\n` +
                                `Please keep this receipt for your records. Show this at the shop to collect your item.\n\n` +
                                `Thank you for choosing HeritX!`;

                              const url = `https://wa.me/91${order.renter_phone ? order.renter_phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(text)}`;
                              window.open(url, '_blank');

                              // Transition status to active
                              handleUpdateStatus(order.order_id, 'active');
                            }}>
                              <FaWhatsapp size={18} />
                            </button>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px 4px 4px', background: '#f8fafc', borderRadius: '100px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
              {settingsData.profile_photo ? (
                <img
                  key={settingsData.profile_photo} // Force re-render on change
                  src={settingsData.profile_photo.startsWith('blob:')
                    ? settingsData.profile_photo
                    : `${settingsData.profile_photo}?t=${new Date().getTime()}`}
                  alt="Profile"
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  onError={(e) => console.log('Image Load Error:', settingsData.profile_photo)}
                />
              ) : (
                <div className="avatar-circle" style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{user?.name ? user.name.charAt(0) : 'U'}</div>
              )}
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{settingsData.shop_name || user?.name || 'User'}</span>
            </div>
            <button onClick={handleLogout} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.color = '#b91c1c'; }} onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}>Sign Out</button>
          </div>
        </div>
        <div className="nav-tabs" style={{ display: 'flex', gap: '8px', borderTop: 'none', overflowX: 'auto', paddingBottom: '4px' }}>
          {['overview', 'inventory', 'orders', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab ? '#0f172a' : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
                border: 'none',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: activeTab === tab ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
              onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = '#64748b'; }}
            >
              {tab === 'orders' ? 'Rentals' : tab}
            </button>
          ))}
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


      {/* Track/Manage Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }} onClick={() => setSelectedOrder(null)}>
          <div className="custom-scrollbar" style={{ width: 640, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden', margin: 'auto', padding: '32px', background: '#ffffff', borderRadius: '28px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem', transition: 'all 0.2s', zIndex: 10 }} onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>&times;</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingRight: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: '#eff6ff', padding: '6px 14px', borderRadius: '100px' }}>
                <FaInfoCircle size={14} /> Details
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Order #{selectedOrder.order_id}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Customer</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{selectedOrder.renter_name}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{selectedOrder.renter_phone}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Total / Paid</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>₹{selectedOrder.total_price}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Razorpay Valid</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Current Status</span>
                <div style={{ display: 'flex' }}>
                  <span className={`badge ${(selectedOrder.status === 'active' || selectedOrder.status === 'confirmed' || selectedOrder.status === 'completed') ? 'success' : selectedOrder.status === 'pending' ? 'warning' : 'info'}`} style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, letterSpacing: '0.2px' }}>{selectedOrder.status.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)', border: '1px solid #e4e4e7', padding: '16px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 36, height: 36, background: '#fff', color: '#52525b', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>🔒</div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Held Deposit</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#27272a', lineHeight: 1.1 }}>₹{selectedOrder.deposit_amount}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.2px' }}>Type</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#52525b', background: '#e4e4e7', padding: '4px 10px', borderRadius: '8px' }}>Rental</span>
              </div>
            </div>

            <div>

              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'active' && selectedOrder.status !== 'pending' && (
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <button className="btn btn-primary" style={{ background: '#25D366', borderColor: '#25D366', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 6px rgba(37, 211, 102, 0.2)' }} onClick={() => {
                    const rentAmount = parseFloat(String(selectedOrder.total_price || 0)) - parseFloat(String(selectedOrder.deposit_amount || 0));
                    const text = `🧾 *Rental Booking Receipt - HeritX*\n\n` +
                      `*Order ID:* #${selectedOrder.order_id}\n` +
                      `*Item:* ${selectedOrder.item_name}\n\n` +
                      `--- Payment Breakdown ---\n` +
                      `*Daily Rental Fee:* ₹${rentAmount}\n` +
                      `*Security Deposit:* ₹${selectedOrder.deposit_amount}\n` +
                      `----------------------------\n` +
                      `*Total Paid:* ₹${selectedOrder.total_price}\n\n` +
                      `✅ *Payment Status:* Verified via Razorpay\n\n` +
                      `Please keep this receipt for your records.\n\n` +
                      `Thank you for choosing HeritX!`;

                    const url = `https://wa.me/91${selectedOrder.renter_phone ? selectedOrder.renter_phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');

                    if (selectedOrder.status === 'confirmed') {
                      handleUpdateStatus(selectedOrder.order_id, 'active');
                    }
                  }}>
                    <FaWhatsapp size={16} /> Send WhatsApp Receipt
                  </button>
                </div>
              )}

              {selectedOrder.status === 'completed' && (
                <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
                  <div style={{ width: 36, height: 36, background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 2px 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>Order Completed</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Item returned securely. Deposit has been settled.</p>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'active' && (
                <div className="fade-in">
                  <div style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    {modalStep === 'RETURN_CHOICE' && (
                      <div className="fade-in">
                        <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '16px', fontSize: '0.95rem' }}>Return Item Processing</p>
                        <div style={{ display: 'flex', gap: '14px' }}>
                          <div
                            onClick={() => {
                              const text = `🧾 *Return Confirmation - HeritX*\n\n` +
                                `*Order ID:* #${selectedOrder.order_id}\n` +
                                `*Item:* ${selectedOrder.item_name}\n\n` +
                                `✅ *Condition:* Returned without any damage.\n` +
                                `💰 *Deposit Refund:* ₹${selectedOrder.deposit_amount}\n\n` +
                                `Your refund has been processed via Razorpay and will reflect in your account in 5-7 business days.\n\n` +
                                `Thank you for using HeritX!`;
                              const url = `https://wa.me/91${selectedOrder.renter_phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                              window.open(url, '_blank');
                              setModalStep('SAFE_REFUND');
                            }}
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: 28, height: 28, background: '#10b981', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>✓</div>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Perfect Return</span>
                          </div>

                          <div
                            onClick={() => setModalStep('IMPERFECT_CHOICE')}
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: 28, height: 28, background: '#fee2e2', color: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚠️</div>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Issues Found</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {modalStep === 'IMPERFECT_CHOICE' && (
                      <div className="fade-in">
                        <p style={{ fontWeight: 800, color: '#0f172a', marginBottom: '16px', fontSize: '0.95rem' }}>Select the type of issue:</p>
                        <div style={{ display: 'flex', gap: '14px' }}>
                          <div
                            onClick={() => { setTimeDeduction(0); setModalStep('ISSUE_TYPE'); }}
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#ffedd5'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: 28, height: 28, background: '#ffedd5', color: '#ea580c', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>💥</div>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Item Damaged</span>
                          </div>

                          <div
                            onClick={() => { setTimeDeduction(0); setModalStep('LATE_CHOICE'); }}
                            style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#e0e7ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ width: 28, height: 28, background: '#e0e7ff', color: '#6366f1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⏰</div>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Late Return</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {modalStep === 'SAFE_REFUND' && (
                      <div className="fade-in" style={{ textAlign: 'center', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: 48, height: 48, background: '#dcfce7', color: '#16a34a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>💸</div>
                          <h3 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>₹{selectedOrder.deposit_amount}</h3>
                        </div>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.95rem', fontWeight: 500 }}>Ready to deeply refund full deposit via Razorpay.</p>
                        <button
                          className="btn"
                          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800, background: '#0f172a', color: '#fff', border: 'none', borderRadius: '16px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          onClick={(e) => {
                            e.preventDefault();
                            openOwnerRazorpay(selectedOrder.deposit_amount, () => {
                              setModalStep('RETURN_CHOICE');
                              setSelectedOrder(null);
                            });
                          }}
                        >
                          💳 Pay Full Refund via Razorpay
                        </button>
                      </div>
                    )}

                    {modalStep === 'ISSUE_TYPE' && (
                      <div className="fade-in">
                        <p style={{ fontWeight: 700, color: '#334155', marginBottom: '16px', fontSize: '0.95rem' }}>Select Damage Level:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                          {[
                            { level: 25, label: 'Minor', color: '#f59e0b' },
                            { level: 50, label: 'Medium', color: '#ea580c' },
                            { level: 75, label: 'Major', color: '#ef4444' },
                            { level: 100, label: 'Full', color: '#991b1b' }
                          ].map(tier => (
                            <button key={tier.level} className="btn" style={{ padding: '10px 4px', background: '#fff', borderColor: tier.color, color: tier.color, fontWeight: 800, fontSize: '0.8rem', borderRadius: '12px', borderWidth: 2 }} onClick={() => {
                              setDamageDeduction((tier.level / 100) * selectedOrder.deposit_amount);
                              setDamageLabel(`${tier.label} Damage (${tier.level}%)`);
                              setTimeDeduction(0); // 0 late days
                              setModalStep('PROCESS_ISSUE_REFUND');
                            }}>
                              <span style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>{tier.label}</span>
                              <span>{tier.level}%</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalStep === 'LATE_CHOICE' && (
                      <div className="fade-in">
                        <p style={{ fontWeight: 700, color: '#334155', marginBottom: '16px', fontSize: '0.95rem' }}>Late Return Penalty:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {[
                            { level: 5, label: '<24h', days: 1 },
                            { level: 10, label: '<48h', days: 2 },
                            { level: 15, label: '3d', days: 3 },
                            { level: 20, label: '4d', days: 4 },
                            { level: 25, label: '5d+', days: 5 }
                          ].map(tier => (
                            <button key={tier.days} className="btn" style={{ flex: '1 1 calc(33.333% - 8px)', padding: '10px 4px', background: '#fff', color: '#6366f1', borderColor: '#6366f1', fontWeight: 800, fontSize: '0.8rem', borderRadius: '12px', borderWidth: 2 }} onClick={() => {
                              setDamageDeduction((tier.level / 100) * selectedOrder.deposit_amount);
                              setDamageLabel(`Late: ${tier.label} (${tier.level}%)`);
                              setTimeDeduction(tier.days);
                              setModalStep('PROCESS_ISSUE_REFUND');
                            }}>
                              <span style={{ display: 'block', fontSize: '0.9rem', marginBottom: '2px' }}>{tier.label}</span>
                              <span>{tier.level}%</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {modalStep === 'PROCESS_ISSUE_REFUND' && (
                      <div className="fade-in">
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ color: '#991b1b', fontWeight: 800, fontSize: '0.9rem' }}>Penalty ({damageLabel})</span>
                            <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem', background: '#fff', padding: '4px 8px', borderRadius: '8px' }}>- ₹{damageDeduction}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '2px dashed #fca5a5' }}>
                            <span style={{ color: '#450a0a', fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Final Refund</span>
                            <span style={{ color: '#0f172a', fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.5px' }}>₹{selectedOrder.deposit_amount - damageDeduction}</span>
                          </div>
                        </div>

                        <button
                          className="btn"
                          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800, background: '#3395FF', color: '#fff', border: 'none', borderRadius: '16px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(51, 149, 255, 0.2)' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                          onClick={(e) => {
                            e.preventDefault();
                            const refundAmt = selectedOrder.deposit_amount - damageDeduction;
                            openOwnerRazorpay(refundAmt, () => {
                              setModalStep('RETURN_CHOICE');
                              setSelectedOrder(null);
                            });
                          }}
                        >
                          💳 Pay Partial Refund via Razorpay
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.status === 'confirmed' && (
                <div className="fade-in" style={{ padding: '16px', background: '#f0f9ff', borderRadius: '20px', border: '1px solid #bae6fd', textAlign: 'center' }}>
                  <div style={{ color: '#0369a1', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Payment Verified</div>
                  <p style={{ color: '#0c4a6e', fontSize: '0.85rem', margin: 0 }}>Send the WhatsApp receipt to start the rental.</p>
                </div>
              )}

              {selectedOrder.status === 'pending' && (
                <div className="fade-in" style={{ background: '#f8fafc', padding: '16px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '1rem', color: '#1e293b', margin: '0 0 12px 0', textAlign: 'center' }}>Review Booking Request</h4>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.9rem', fontWeight: 800, background: '#10b981', borderColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'active')}>
                      <span style={{ fontSize: '1.1rem' }}>✓</span> Approve
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '12px', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', borderColor: '#fca5a5', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleUpdateStatus(selectedOrder.order_id, 'cancelled')}>
                      <span style={{ fontSize: '1.1rem' }}>×</span> Reject
                    </button>
                  </div>
                </div>
              )}
              {(selectedOrder.status !== 'active' && selectedOrder.status !== 'confirmed' && selectedOrder.status !== 'pending' && selectedOrder.status !== 'completed') && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px', fontSize: '0.85rem' }}>
                  <p style={{ margin: 0 }}>No additional actions available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Post-Payment Success Receipt Panel ── */}
      {ownerPaymentSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 10002,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '40px 36px',
            maxWidth: '440px',
            width: '90%',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.25)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close */}
            <button
              onClick={() => setOwnerPaymentSuccess(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>

            {/* Success Icon */}
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>✅</div>

            <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>Payment Successful!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 28px' }}>Deposit refund processed via Razorpay</p>

            {/* Receipt Details */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem', color: '#64748b' }}>
                <span>Customer</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{ownerPaymentSuccess.order?.renter_name || 'Customer'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem', color: '#64748b' }}>
                <span>Order ID</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>#{ownerPaymentSuccess.order?.order_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.88rem', color: '#64748b' }}>
                <span>Payment ID</span>
                <span style={{ fontWeight: 600, color: '#3395FF', fontSize: '0.8rem' }}>{ownerPaymentSuccess.paymentId}</span>
              </div>
              <div style={{ borderTop: '2px dashed #e2e8f0', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Amount Paid</span>
                <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#16a34a' }}>₹{ownerPaymentSuccess.amount}</span>
              </div>
            </div>

            {/* Auto Email Notice */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <span style={{ fontSize: '1.2rem' }}>📧</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#15803d' }}>Email Receipt Sent Automatically</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Sent to {ownerPaymentSuccess.order?.renter_email}</div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={async () => {
                const phone = (ownerPaymentSuccess.order?.contact_number ||
                               ownerPaymentSuccess.order?.renter_phone || '').replace(/\D/g, '');
                const name  = ownerPaymentSuccess.order?.renter_name || 'Customer';
                const ordId = ownerPaymentSuccess.order?.order_id;
                const amt   = ownerPaymentSuccess.amount;
                const payId = ownerPaymentSuccess.paymentId;
                const msg   =
                  `🧾 *Rental Refund Receipt - HeritX*\n\n` +
                  `Hello ${name}, your deposit refund for Order #${ordId} has been successfully processed.\n\n` +
                  `*--- Details ---*\n` +
                  `💰 *Refund Amount:* ₹${amt}\n` +
                  `📄 *Payment Reference:* ${payId}\n` +
                  `✅ *Status:* Refund Successful\n\n` +
                  `*--- Shop Info ---*\n` +
                  `🏪 *Store:* ${settingsData.shop_name}\n` +
                  `📞 *Contact:* ${settingsData.phone}\n\n` +
                  `If you have any questions regarding this refund, please contact the shop. Thank you for choosing HeritX! 🙏`;
                // Open WhatsApp
                window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                // Mark order as completed in the database
                await handleUpdateStatus(ordId, 'completed');
                // Close the success panel
                setOwnerPaymentSuccess(null);
              }}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                background: '#25D366', color: '#fff', fontWeight: 800,
                fontSize: '1rem', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,211,102,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,211,102,0.3)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Send Receipt via WhatsApp
            </button>

            <button
              onClick={() => setOwnerPaymentSuccess(null)}
              style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >Done</button>
          </div>
        </div>
      )}

      {/* Razorpay Visual Twin Simulation Modal */}
      {isRefundSimulating && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10001,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="modal-content" style={{ maxWidth: '420px', width: '90%', padding: 0, overflow: 'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>

            {/* Razorpay Branded Header */}
            <div style={{ background: '#3395FF', padding: '15px 25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Razorpay</div>
                <div style={{ height: '20px', width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>HertiX Rentals</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Test Mode</div>
            </div>

            {refundStep === 'SELECTION' && (
              <div style={{ background: '#fff', display: 'flex', minHeight: '380px' }} className="fade-in">
                {/* Left Sidebar */}
                <div style={{ width: '140px', background: '#1a1a1a', padding: '25px 15px', color: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: '#fff', color: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>H</div>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>HeritX Rentals</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase' }}>Refund Amount</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{refundResult?.amount}</div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3395FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px' }}>👤</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>+{selectedOrder.renter_phone.slice(-4)}</span>
                  </div>
                </div>

                {/* Right Content */}
                <div style={{ flex: 1, padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Options</h5>
                    <button style={{ background: 'none', border: 'none', color: '#3395FF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Language</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ border: '2px solid #3395FF', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', background: '#f0f7ff', position: 'relative' }}>
                      <div style={{ width: '20px', height: '20px', border: '6px solid #3395FF', borderRadius: '50%' }}></div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Original Source</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Refund will be credited to payer's account</div>
                      </div>
                      <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>RECOMMENDED</span>
                    </div>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.6 }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderRadius: '50%' }}></div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Direct UPI ID</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enter a custom VPA for refund</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setRefundStep('PROCESSING');
                      try {
                        const res = await fetch('/HertiX/admin/public/api/shop_refund_deposit.php', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            order_id: selectedOrder.order_id,
                            owner_id: user?.id,
                            refund_amount: refundResult?.amount,
                            damage_type: damageLabel,
                            deduction: damageDeduction,
                            late_days: timeDeduction
                          })
                        });
                        const d = await res.json();

                        // Wait for animation to feel natural
                        setTimeout(() => {
                          if (d.status === 'success') {
                            setRefundResult({ ...refundResult, ...d });
                            setRefundStep('SUCCESS');

                            // Send WhatsApp
                            const text = `🧾 *Rental Refund Receipt - HeritX*\n\n` +
                              `Dear Customer, your rental return for Order #${selectedOrder.order_id} (${selectedOrder.item_name}) has been processed.\n\n` +
                              `*--- Refund Summary ---*\n` +
                              `💰 *Initial Deposit:* ₹${selectedOrder.deposit_amount}\n` +
                              `📉 *Deduction (Damage/Issue):* -₹${damageDeduction} (${damageLabel}${damageNote ? ': ' + damageNote : ''})\n` +
                              (timeDeduction > 0 ? `⏰ *Late Fee Deduction:* -₹${timeDeduction} (${timeLabel})\n` : '') +
                              `----------------------------\n` +
                              `💵 *Final Refund Amount:* ₹${refundResult?.amount}\n\n` +
                              `✅ *Status:* Refund initiated via Razorpay. It usually reflects in your account within 5-7 business days.\n\n` +
                              `*--- Shop Contact ---*\n` +
                              `🏪 *Shop:* ${settingsData.shop_name}\n` +
                              `📞 *Phone:* ${settingsData.phone}\n\n` +
                              `If you have any further questions regarding this deduction, please feel free to contact the shop directly. Thank you for using HeritX!`;
                            const url = `https://wa.me/91${selectedOrder.renter_phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                            window.open(url, '_blank');

                            if (user?.id) fetchRealData(user.id);
                          } else {
                            setIsRefundSimulating(false);
                            triggerAlert('Refund Error', d.message);
                          }
                        }, 3000);
                      } catch (err) {
                        setIsRefundSimulating(false);
                        triggerAlert('Error', 'Connection failed.');
                      }
                    }}
                    style={{ width: '100%', marginTop: '30px', padding: '14px', background: '#3395FF', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(51, 149, 255, 0.3)' }}
                  >
                    Continue to Refund
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '14px', opacity: 0.5 }} />
                  </div>
                </div>
              </div>
            )}

            {refundStep === 'PROCESSING' && (
              <div style={{ padding: '60px 40px', textAlign: 'center', background: '#fff' }} className="fade-in">
                <div className="coin-animation-container">
                  <div className="glow-effect"></div>
                  <div className="gold-coin">₹</div>
                  <div className="slot-line"></div>
                </div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>Confirming Payment</h4>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>This will only take a few seconds.</p>

                <div style={{ marginTop: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Secured by</span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '12px', opacity: 0.6 }} />
                </div>
              </div>
            )}

            {refundStep === 'SUCCESS' && (
              <div style={{ padding: '40px 30px', background: '#fff' }} className="fade-in">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <div style={{ width: '70px', height: '70px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>✓</div>
                  </div>
                  <h4 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', marginBottom: '5px', letterSpacing: '-0.5px' }}>Refund Successful</h4>
                  <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Successfully sent back to original source</p>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '30px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Transaction Amount</span>
                    <span style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 900 }}>₹{refundResult?.amount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Refund ID</span>
                    <span style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace' }}>{refundResult?.refund_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Reference No.</span>
                    <span style={{ color: '#334155', fontSize: '0.9rem', fontWeight: 700 }}>{Math.floor(Math.random() * 900000000000) + 10000000000}</span>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', padding: '16px', background: '#3395FF', borderColor: '#3395FF', fontWeight: 800, borderRadius: '8px', fontSize: '1.05rem', boxShadow: '0 4px 12px rgba(51, 149, 255, 0.2)' }} onClick={() => {
                  setIsRefundSimulating(false);
                  setRefundResult(null);
                  setSelectedOrder(null);
                }}>Close & Back to Dashboard</button>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '14px', opacity: 0.4 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* ROOT LEVEL MODALS - Placed outside of any scrolling containers */}

      {showAddModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 10001,
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => { setShowAddModal(false); setEditItemId(null); }}
        >
          <div
            className="modern-card"
            style={{
              width: 650, maxWidth: '95vw', padding: 0,
              margin: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', padding: '20px 25px', background: '#f8fafc', zIndex: 10 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>{editItemId ? 'Edit Item' : 'Add New Item'}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => { setShowAddModal(false); setEditItemId(null); setNewItem({ name: '', category: 'Attire', occasion: 'Onam', quality: 'Good', quantity: '1', price: '', deposit: '', description: '', dos: '', donts: '', image: null }); }} style={{ padding: '4px 12px', border: '1px solid #e2e8f0' }}>Close✕</button>
            </div>

            <div className="card-body" style={{ padding: '25px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="field">
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Product Name</span>
                  <input required placeholder="e.g. Bronze Nilavilakku" value={newItem.name} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} onChange={e => {
                    const val = e.target.value;
                    if (!/\d/.test(val)) {
                      setNewItem({ ...newItem, name: val });
                    }
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Category</span>
                    <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                      style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}>
                      <option value="Attire">Attire</option>
                      <option value="Jewellery">Jewellery</option>
                      <option value="Musical Instruments">Musical Instruments</option>
                      <option value="Ritual Items">Ritual Items</option>
                      <option value="Decorations">Decorations</option>
                      <option value="Traditional Lamps">Traditional Lamps</option>
                      <option value="Costumes">Costumes</option>
                      <option value="Headgear & Accessories">Headgear & Accessories</option>
                      <option value="Art & Performance Props">Art & Performance Props</option>
                      <option value="Festival Essentials">Festival Essentials</option>
                    </select>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Occasion</span>
                    <select value={newItem.occasion} onChange={e => setNewItem({ ...newItem, occasion: e.target.value })}
                      style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}>
                      <option value="Onam">Onam</option>
                      <option value="Vishu">Vishu</option>
                      <option value="Temple Festival">Temple Festival</option>
                      <option value="Wedding Ceremony">Wedding Ceremony</option>
                      <option value="Housewarming">Housewarming (Grihapravesham)</option>
                      <option value="Kathakali Performance">Kathakali Performance</option>
                      <option value="Mohiniyattam Performance">Mohiniyattam Performance</option>
                      <option value="Cultural Program">Cultural Program</option>
                      <option value="Traditional Ritual">Traditional Ritual</option>
                      <option value="Annual Festival">Annual Festival / Utsavam</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Item Condition</span>
                  <select value={newItem.quality} onChange={e => setNewItem({ ...newItem, quality: e.target.value })}
                    style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: '8px', width: '100%' }}>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                      <button type="button"
                        onClick={() => {
                          const val = parseInt(newItem.quantity || '1');
                          if (val > 1) setNewItem({ ...newItem, quantity: (val - 1).toString() });
                        }}
                        style={{ border: 'none', background: '#f8fafc', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}
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
                        style={{ border: 'none', background: '#f8fafc', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', color: '#0f172a' }}
                      >+</button>
                    </div>
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Daily Rent (₹)</span>
                    <input type="number" placeholder="500" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                  </div>
                </div>
                <div className="field">
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Deposit Amount (₹)</span>
                  <input type="number" placeholder="1000" value={newItem.deposit} onChange={e => setNewItem({ ...newItem, deposit: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                </div>
                <div className="field">
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Value Description</span>
                  <textarea
                    placeholder="Detailed description of the item..."
                    value={newItem.description}
                    onChange={e => {
                      const val = e.target.value;
                      if (!/\d/.test(val)) {
                        setNewItem({ ...newItem, description: val });
                      }
                    }}
                    rows={3}
                    style={{
                      resize: 'vertical',
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: '16px' }}>
                <div className="field" style={{ flex: 1 }}>
                  <span style={{ color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                    <span>✅</span> Do's (Optional)
                  </span>
                  <textarea
                    placeholder="e.g. Clean slowly&#10;Keep dry"
                    value={newItem.dos}
                    onChange={e => setNewItem({ ...newItem, dos: e.target.value })}
                    rows={3}
                    style={{
                      resize: 'vertical',
                      border: '1px solid #bbf7d0',
                      background: '#f0fdf4',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <span style={{ color: '#b91c1c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                    <span>❌</span> Don'ts (Optional)
                  </span>
                  <textarea
                    placeholder="e.g. No bleach&#10;Avoid water"
                    value={newItem.donts}
                    onChange={e => setNewItem({ ...newItem, donts: e.target.value })}
                    rows={3}
                    style={{
                      resize: 'vertical',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
              <div className="field" style={{ marginTop: '16px' }}>
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Upload Image</span>
                <input type="file" accept="image/*" onChange={e => setNewItem({ ...newItem, image: e.target.files ? e.target.files[0] : null })}
                  style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', width: '100%', background: '#f8fafc' }} />
              </div>
            </div>

            <div style={{ padding: '20px 25px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)'
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : (editItemId ? 'Save Changes' : 'Publish Listing')}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10001
        }}>
          <div className="modern-card" style={{ width: 450, maxWidth: '95vw', padding: 0, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '16px' }}>
            <div style={{ position: 'relative', height: 250, background: '#f8fafc' }}>
              <img
                src={viewItem.image_url ? `/HertiX/${viewItem.image_url}` : 'https://via.placeholder.com/300'}
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
                background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                padding: '30px 20px 15px', color: 'white'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{viewItem.name}</h3>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', marginTop: 8, display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {viewItem.category}
                </span>
              </div>
            </div>

            <div className="card-body" style={{ padding: 25 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Price per Day</label>
                  <div style={{ fontSize: '1.25rem', color: '#2563eb', fontWeight: 800 }}>₹{viewItem.price_per_day}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Security Deposit</label>
                  <div style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>₹{viewItem.deposit_amount}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Occasion</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewItem.occasion}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600 }}>Available Qty</label>
                  <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 500 }}>{viewItem.quantity || 1} units</div>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
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
};

export default ShopOwnerDashboard;
