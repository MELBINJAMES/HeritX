import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { MdMyLocation } from 'react-icons/md';
import { FaLocationArrow } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon broken by Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const createCustomIcon = (bgColor, textColor, iconEmoji, extraClass = '') => {
    return new L.divIcon({
        className: `custom-div-icon ${extraClass}`,
        html: `
            <div class="pin-wrapper" style="width: 50px; height: 60px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
                <div class="pin-main" style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 2px solid white; margin-bottom: 2px;">
                    <span style="transform: rotate(45deg); font-size: 16px; color: ${textColor}; line-height: 1; display: block;">${iconEmoji}</span>
                </div>
                <div class="pin-shadow" style="width: 10px; height: 4px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(1px);"></div>
            </div>
        `,
        iconSize: [50, 60],
        iconAnchor: [25, 52],
        popupAnchor: [0, -50]
    });
};

const nearbyIcon = createCustomIcon('#1e293b', '#fff', '🏷️');
const userIcon = createCustomIcon('#3b82f6', '#fff', '⭐', 'user-pulse');

// Sub-component: auto-fit bounds to show all markers
const MapBoundsFitter = ({ userCoords, shopCoords }) => {
    const map = useMap();
    const initialFitDone = useRef(false);

    // Fix for grey map tiles: watch the container for layout changes
    useEffect(() => {
        let timeoutId;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                map.invalidateSize();
            }, 100);
        });

        const container = map.getContainer();
        if (container) {
            resizeObserver.observe(container);
        }

        // Initial force
        setTimeout(() => map.invalidateSize(), 50);

        return () => {
            clearTimeout(timeoutId);
            if (container) resizeObserver.unobserve(container);
            resizeObserver.disconnect();
        };
    }, [map]);

    // Fit bounds to show User + all Shops (only when coords actually change)
    useEffect(() => {
        if (initialFitDone.current) return; // Prevent fighting with Locate Me or manual panning

        const bounds = L.latLngBounds([]);
        let hasPoints = false;

        // Ensure user coordinates are valid numbers before extending
        const validUserLat = parseFloat(userCoords?.[0]);
        const validUserLng = parseFloat(userCoords?.[1]);
        if (!isNaN(validUserLat) && !isNaN(validUserLng)) {
            bounds.extend([validUserLat, validUserLng]);
            hasPoints = true;
        }

        // Ensure shop coordinates are valid numbers before extending
        if (shopCoords && shopCoords.length > 0) {
            shopCoords.forEach(coord => {
                const validLat = parseFloat(coord.lat);
                const validLng = parseFloat(coord.lng);
                if (!isNaN(validLat) && !isNaN(validLng)) {
                    bounds.extend([validLat, validLng]);
                    hasPoints = true;
                }
            });
        }

        if (hasPoints && bounds.isValid()) {
            map.invalidateSize(); // Ensure container is ready before fitting
            // Padding so markers aren't exactly on the screen edge
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1 });
            initialFitDone.current = true;
        }
    }, [userCoords, shopCoords, map]);

    return null;
};

// Sub-component: Routing Path Drawer
const RoutingPath = ({ userCoords, destCoords, onRouteFound }) => {
    const map = useMap();
    const [path, setPath] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);

    useEffect(() => {
        if (!userCoords || !destCoords) {
            setPath(null);
            setRouteInfo(null);
            return;
        }

        const url = `https://router.project-osrm.org/route/v1/driving/${userCoords[1]},${userCoords[0]};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setPath(coords);
                    const info = {
                        distance: (data.routes[0].distance / 1000).toFixed(1),
                        duration: Math.round(data.routes[0].duration / 60)
                    };
                    setRouteInfo(info);
                    if (onRouteFound) onRouteFound(info);

                    const bounds = L.latLngBounds(coords);
                    map.fitBounds(bounds, { padding: [80, 80], animate: true });
                }
            })
            .catch(err => console.error("Routing error:", err));
    }, [userCoords, destCoords, map]);

    if (!path) return null;

    return (
        <>
            <Polyline
                positions={path}
                pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
            />
            {routeInfo && (
                <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '30px', marginLeft: '10px' }}>
                    <div className="leaflet-control" style={{
                        background: 'white', padding: '10px 15px', borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '2px solid #3b82f6',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>🚗 Route Details</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            Distance: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{routeInfo.distance} km</span><br />
                            Est. Time: <span style={{ color: '#3b82f6', fontWeight: 600 }}>{routeInfo.duration} mins</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Sub-component: Locate Me Button
const LocateControl = () => {
    const map = useMapEvents({
        locationfound(e) {
            map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 1.5 });
            // Pulse effect can be added here if desired.
        },
        locationerror(e) {
            console.warn("Location error:", e.message);
            alert("Could not automatically determine your location. Please check your browser permissions.");
        },
    });

    return (
        <div className="leaflet-top leaflet-right" style={{ marginTop: '70px', marginRight: '10px' }}>
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        map.locate();
                    }}
                    title="Find My Location"
                    style={{
                        width: '34px', height: '34px', background: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontSize: '1.1rem'
                    }}
                >
                    <FaLocationArrow />
                </button>
            </div>
        </div>
    );
};

/**
 * MapView — Leaflet-based shop map
 *
 * Props:
 *   userCity    {string}   — city name for filtering & centering fallback
 *   userLat     {number}   — user's latitude  (preferred over geocoding city)
 *   userLng     {number}   — user's longitude (preferred over geocoding city)
 *   singleShop  {object}   — { lat, lng, name, city } — show only one marker (ShopProfile mode)
 *   height      {string}   — container height (default '420px')
 */
const MapView = ({ userCity, userLat, userLng, singleShop, height = '420px' }) => {
    const [shops, setShops] = useState([]);
    const [center, setCenter] = useState([10.8505, 76.2711]); // Default: Kerala center
    const [selectedShopForRoute, setSelectedShopForRoute] = useState(null);
    const navigate = useNavigate();

    // ── Determine initial/updated map center fallback ─────────────────────────
    useEffect(() => {
        // Fallback — geocode city string (only if no coords available)
        if (!userLat && !userLng && userCity && !singleShop) {
            fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(userCity)}&format=json&limit=1`)
                .then(r => r.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const fetchedLat = parseFloat(data[0].lat);
                        const fetchedLng = parseFloat(data[0].lon);
                        if (!isNaN(fetchedLat) && !isNaN(fetchedLng)) {
                            setCenter([fetchedLat, fetchedLng]);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [userLat, userLng, userCity, singleShop]);

    // ── Fetch all shop locations (skip in singleShop mode) ───────────────────
    useEffect(() => {
        if (singleShop) return;
        // The instruction implies a change from 3001 to default port, but the original code already uses the default.
        // Assuming the user intended to add the imageUrl line and ensure it uses the correct path.
        // The line below is added as per the provided 'Code Edit' snippet.
        // If 'matchedDbItem' is not defined in this scope, this line might cause an error.
        // For now, it's placed as per the instruction's context.
        // const imageUrl = matchedDbItem.image_url ? `http://localhost/HertiX/uploads/${matchedDbItem.image_url}` : null;
        fetch('http://localhost/HertiX/user-dashboard/backend/api/shop_locations.php')
            .then(r => r.json())
            .then(data => Array.isArray(data) ? setShops(data) : [])
            .catch(err => console.error('MapView fetch err:', err));
    }, [singleShop]);

    const shopsToRender = singleShop
        ? [{ shopId: 0, shopName: singleShop.name, city: singleShop.city, latitude: singleShop.lat, longitude: singleShop.lng, totalItems: null }]
        : shops;

    return (
        <div style={{
            borderRadius: '20px', overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height
        }}>
            <style>{`
                .custom-div-icon {
                    background: none;
                    border: none;
                }
                .pin-main {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .custom-div-icon:hover .pin-main {
                    transform: rotate(-45deg) scale(1.2) translateY(-5px) !important;
                    z-index: 1000 !important;
                }
                @keyframes pin-pulse {
                    0% { transform: rotate(-45deg) scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                    70% { transform: rotate(-45deg) scale(1.05); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                    100% { transform: rotate(-45deg) scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                .user-pulse .pin-main {
                    animation: pin-pulse 2s infinite;
                    border: 2px solid #fff;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .leaflet-container {
                    z-index: 1 !important;
                    font-family: inherit !important;
                }
                /* Custom stylish popup */
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    padding: 0;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: 220px !important;
                }
                .leaflet-popup-tip-container {
                    margin-top: -1px;
                }
            `}</style>
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>

                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Modern Street">
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">Carto</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Realistic Satellite">
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {/* Tracking & Fitting */}
                <LocateControl />
                <MapBoundsFitter
                    userCoords={userLat && userLng ? [userLat, userLng] : (userCity ? center : null)}
                    shopCoords={shopsToRender.map(s => ({ lat: s.latitude, lng: s.longitude }))}
                />

                {/* Routing Path */}
                {userLat && userLng && selectedShopForRoute && (
                    <RoutingPath
                        userCoords={[userLat, userLng]}
                        destCoords={{ lat: selectedShopForRoute.latitude, lng: selectedShopForRoute.longitude }}
                    />
                )}

                {/* User location marker */}
                {userLat && userLng && (
                    <Marker position={[userLat, userLng]} icon={userIcon}>
                        <Popup>
                            <div style={{ padding: '15px' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#3b82f6', fontWeight: 700, marginBottom: '5px' }}>You are here</div>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>Detected Location</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{userCity || 'Searching local area...'}</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Shop markers */}
                {shopsToRender.map((shop, index) => {
                    const validLat = parseFloat(shop.latitude);
                    const validLng = parseFloat(shop.longitude);
                    if (isNaN(validLat) || isNaN(validLng)) return null;

                    return (
                        <Marker
                            key={shop.shopId ?? `shop-${index}`}
                            position={[validLat, validLng]}
                            icon={nearbyIcon}
                        >
                            <Popup>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ background: '#f8fafc', padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {shop.shopName}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            📍 {shop.city}
                                        </div>
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        {shop.totalItems !== null && (
                                            <div style={{ background: '#fef3c7', color: '#92400e', display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '15px' }}>
                                                {shop.totalItems} item{shop.totalItems !== 1 ? 's' : ''} available
                                            </div>
                                        )}
                                        {!singleShop && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={() => setSelectedShopForRoute(shop)}
                                                    style={{
                                                        width: '100%', padding: '10px 0',
                                                        background: '#3b82f6', color: 'white',
                                                        border: 'none', borderRadius: '6px',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                        transition: 'background 0.2s',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#2563eb'}
                                                    onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                                                >
                                                    Show Route 🚗
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const dest = `${validLat},${validLng}`;
                                                        let url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
                                                        if (userLat && userLng && !isNaN(parseFloat(userLat))) {
                                                            url += `&origin=${parseFloat(userLat)},${parseFloat(userLng)}`;
                                                        }
                                                        window.open(url, '_blank');
                                                    }}
                                                    style={{
                                                        width: '100%', padding: '10px 0',
                                                        background: '#f1f5f9', color: '#475569',
                                                        border: '1px solid #e2e8f0', borderRadius: '6px',
                                                        cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                                                        transition: 'background 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                                                    onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
                                                >
                                                    Google Maps 🗺️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default MapView;
