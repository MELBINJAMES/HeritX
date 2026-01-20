import React, { useEffect, useState } from 'react';
import { fetchProfile } from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchProfile().then(data => {
            setProfile(data);
            if (data.profile_image) setImagePreview(data.profile_image);
        });
    }, []);

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
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(profile).forEach(key => {
                if (key !== 'profile_image') { // Don't send URL string back
                    formData.append(key, profile[key]);
                }
            });
            if (selectedFile) {
                formData.append('profile_image', selectedFile);
            }

            const response = await fetch('http://localhost/HertiX/user-dashboard/backend/api/profile.php', {
                method: 'POST',
                body: formData // No Content-Type header needed, browser sets it
            });
            const result = await response.json();
            if (result.success) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + result.message);
            }
        } catch (error) {
            console.error('Update error', error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return <div style={{ padding: 40, textAlign: 'center' }}>Loading your profile...</div>;

    // Helper for input styles
    const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.9rem' };
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '0.95rem', transition: 'border-color 0.2s' };
    const sectionTitle = { fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: '800', color: '#111827' }}>Your Account</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>

                {/* Left Column: Profile Card */}
                <div style={{ flex: '1 1 300px', maxWidth: '350px', background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>

                    {/* Profile Image with Upload Trigger */}
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                        <label htmlFor="profile-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f3f4f6' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#9ca3af' }}>
                                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#1a1a1a', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '2px solid white' }}>+</div>
                        </label>
                        <input id="profile-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 5px' }}>{profile.name || 'User'}</h2>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', marginBottom: '15px' }}>Member since 2026</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', margin: '20px 0', fontSize: '0.9rem', color: '#4b5563' }}>
                        {profile.role && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontWeight: '600', fontSize: '0.8rem' }}>
                                <span>🛡️</span> {profile.role}
                            </div>
                        )}
                        {profile.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📍</span> {profile.location}
                            </div>
                        )}
                        {profile.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📧</span> {profile.email}
                            </div>
                        )}
                        {profile.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>📞</span> {profile.phone}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '10px', padding: '15px', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                        {profile.bio || "No bio added yet. Tell us about yourself!"}
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Personal Information */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={sectionTitle}>Personal Information</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input type="text" name="name" value={profile.name || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Date of Birth</label>
                                <input type="date" name="dob" value={profile.dob || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Gender</label>
                                <select name="gender" value={profile.gender || ''} onChange={handleChange} style={inputStyle}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Bio</label>
                                <textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows={3} style={inputStyle} placeholder="Share a little closer look..." />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={sectionTitle}>Contact Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" name="email" value={profile.email || ''} onChange={handleChange} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="text" name="phone" value={profile.phone || ''} onChange={handleChange} style={inputStyle} placeholder="+91..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Location (City/State)</label>
                                <input type="text" name="location" value={profile.location || ''} onChange={handleChange} style={inputStyle} placeholder="e.g. Kochi, Kerala" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Shipping Address</label>
                                <textarea name="address" value={profile.address || ''} onChange={handleChange} rows={3} style={inputStyle} placeholder="Enter your full address" />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ textAlign: 'right' }}>
                        <button
                            onClick={updateProfile}
                            disabled={loading}
                            style={{
                                padding: '12px 30px',
                                background: '#1a1a1a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                opacity: loading ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
