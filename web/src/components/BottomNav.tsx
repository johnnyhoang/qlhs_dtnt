import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    TableOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';

const { Footer } = Layout;

interface BottomNavProps {
    hasAccess: (module: string) => boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ hasAccess }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Home',
            path: '/'
        },
        hasAccess('hoc-sinh') && {
            key: '/hoc-sinh',
            icon: <UserOutlined />,
            label: 'HS',
            path: '/hoc-sinh'
        },
        hasAccess('suat-an') && {
            key: '/suat-an',
            icon: <TableOutlined />,
            label: 'An',
            path: '/suat-an'
        },
        hasAccess('thanh-toan') && {
            key: '/thanh-toan',
            icon: <DollarCircleOutlined />,
            label: 'Tiền',
            path: '/thanh-toan'
        }
    ].filter(Boolean) as any[];

    return (
        <Footer
            className="mobile-only"
            style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                padding: '8px 0',
                background: '#fff',
                borderTop: '1px solid #f0f0f0',
                zIndex: 1000,
                boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {navItems.map(item => (
                    <div
                        key={item.key}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: location.pathname === item.path ? '#1677ff' : '#8c8c8c',
                            transition: 'color 0.3s'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span style={{ fontSize: '10px', marginTop: '2px' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </Footer>
    );
};

export default BottomNav;
