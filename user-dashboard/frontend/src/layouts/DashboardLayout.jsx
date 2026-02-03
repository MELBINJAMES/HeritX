import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Wrapper for the Protected Dashboard Area
const DashboardLayout = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
