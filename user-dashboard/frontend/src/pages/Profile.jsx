import React, { useEffect, useState } from 'react';
import { fetchProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [saving, setSaving] = useState(false);

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return "Password must be at least 8 characters.";
        if (!/[A-Z]/.test(pwd)) return "Password must have at least one uppercase letter.";
        if (!/[a-z]/.test(pwd)) return "Password must have at least one lowercase letter.";
        return null;
    };

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        if (user?.id) {
            loadProfile(user.id);
        }
    }, [user]); // Reload when user context changes

    const loadProfile = (userId) => {
        setLoading(true);
        setError(null);
        fetchProfile(userId)
            .then(data => {
                if (!data || data.error) {
                    throw new Error(data?.error || "Failed to load profile data");
                }
                setProfile(data);
                if (data.profile_image) setImagePreview(data.profile_image);
            })
            .catch(err => {
                console.error("Profile Load Error:", err);
                setError("Could not load profile. Please try again.");
            })
            .finally(() => setLoading(false));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const updateProfile = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (key !== 'profile_image' && profile[key] !== null) {
                    formData.append(key, profile[key]);
                }
            });
            if (selectedFile) {
                formData.append('profile_image', selectedFile);
            }

            const response = await fetch('http://localhost/HertiX/user-dashboard/backend/api/profile.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                showNotification('Profile updated successfully!', 'success');
            } else {
                showNotification('Failed to update: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Update error', error);
            showNotification('An error occurred while updating', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
            showNotification('Please fill all password fields', 'error');
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        const pwdError = validatePassword(passwordData.new_password);
        if (pwdError) {
            showNotification(pwdError, 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`http://localhost/HertiX/user-dashboard/backend/api/profile.php?action=change_password&user_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            });
            const result = await response.json();
            if (result.success) {
                showNotification('Password updated successfully!', 'success');
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                showNotification(result.message, 'error');
            }
        } catch (error) {
            showNotification('An error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading-state">Loading your profile...</div>;

    if (error) return (
        <div className="loading-state" style={{ color: 'red' }}>
            <p>{error}</p>
            <button onClick={() => loadProfile(user?.id)} className="save-btn" style={{ marginTop: 10 }}>Retry</button>
        </div>
    );

    if (!profile) return null;

    const memberSince = profile.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : '2026';

    const nameInitial = (profile.name && profile.name.length > 0)
        ? profile.name.charAt(0).toUpperCase()
        : 'U';

    return (
        <div className="profile-container">

            {/* Header with Cover & Avatar */}
            <div className="profile-header">
                <div className="profile-cover"></div>

                <div className="profile-info-overlay">
                    <div className="profile-avatar-wrapper">
                        <label htmlFor="profile-upload" style={{ cursor: 'pointer', display: 'block', height: '100%' }}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="profile-avatar" />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {nameInitial}
                                </div>
                            )}
                            <div className="upload-button">📷</div>
                        </label>
                        <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </div>

                    <div className="profile-identity">
                        <h1>{profile.name || 'User Name'}</h1>
                        <div className="profile-role-badge">
                            <span>🛡️</span> {profile.role || 'Member'}
                        </div>
                    </div>

                    <div className="member-since">
                        Member since {memberSince}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Edit Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="profile-card overview-section">
                        <div className="info-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>About</h3>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                    title="Edit Bio"
                                >
                                    ✏️
                                </button>
                            </div>
                            <p className="bio-text">
                                {profile.bio || "No bio added yet. Go to 'Edit Profile' to introduce yourself!"}
                            </p>
                        </div>

                        <div className="info-group">
                            <h3>Personal Details</h3>
                            <div className="overview-grid">
                                <div className="info-item">
                                    <span className="info-label">Full Name</span>
                                    <span className="info-value">{profile.name || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Date of Birth</span>
                                    <span className="info-value">{profile.dob || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Gender</span>
                                    <span className="info-value">{profile.gender || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Location</span>
                                    <span className="info-value">{profile.location || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-group">
                            <h3>Contact Information</h3>
                            <div className="overview-grid">
                                <div className="info-item">
                                    <span className="info-label">Email Address</span>
                                    <span className="info-value">{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone Number</span>
                                    <span className="info-value">{profile.phone || '-'}</span>
                                </div>
                                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                                    <span className="info-label">Shipping Address</span>
                                    <span className="info-value">{profile.address || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="profile-card">
                        <h3 className="card-title">Update Your Information</h3>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className="form-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input type="date" name="dob" value={profile.dob || ''} onChange={handleChange} className="form-input" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select name="gender" value={profile.gender || ''} onChange={handleChange} className="form-input">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} className="form-input" placeholder="+91..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location (City)</label>
                                <input type="text" name="location" value={profile.location || ''} onChange={handleChange} className="form-input" placeholder="e.g. Kochi" />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Shipping Address</label>
                                <textarea name="address" value={profile.address || ''} onChange={handleChange} className="form-input form-textarea" rows={3} placeholder="Full address for deliveries" />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Bio (Public)</label>
                                <textarea name="bio" value={profile.bio || ''} onChange={handleChange} className="form-input form-textarea" rows={3} placeholder="Tell us about yourself..." />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button
                                onClick={updateProfile}
                                disabled={saving}
                                className="save-btn"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="profile-card">
                        <h3 className="card-title">Password & Security</h3>
                        <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.9rem' }}>
                            Ensure your account stays secure by using a strong password. Current requirements: 8+ characters, at least one uppercase and one lowercase letter.
                        </p>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    className="form-input"
                                    placeholder="8+ chars, 1 uppercase, 1 lowercase"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '20px' }}>
                            <button
                                onClick={handlePasswordChange}
                                disabled={saving}
                                className="save-btn"
                                style={{ background: '#1e293b' }}
                            >
                                {saving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Profile;
