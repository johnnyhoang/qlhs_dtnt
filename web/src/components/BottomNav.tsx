import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import {
  DashboardOutlined,
  FundProjectionScreenOutlined,
  UserOutlined,
  TableOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Footer } = Layout;

interface BottomNavProps {
  hasAccess: (module: string) => boolean;
  canManageCms: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ hasAccess, canManageCms }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCdsApp = location.pathname.startsWith('/admin/cds');

  const qlhsNavItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Home',
      path: '/admin',
    },
    hasAccess('hoc-sinh') && {
      key: '/admin/hoc-sinh',
      icon: <UserOutlined />,
      label: 'HS',
      path: '/admin/hoc-sinh',
    },
    hasAccess('suat-an') && {
      key: '/admin/suat-an',
      icon: <TableOutlined />,
      label: 'An',
      path: '/admin/suat-an',
    },
    hasAccess('thanh-toan') && {
      key: '/admin/thanh-toan',
      icon: <DollarCircleOutlined />,
      label: 'Ti?n',
      path: '/admin/thanh-toan',
    },
    canManageCms && {
      key: '/admin/cms',
      icon: <FileTextOutlined />,
      label: 'CMS',
      path: '/admin/cms',
    },
  ].filter(Boolean) as Array<{ key: string; icon: React.ReactNode; label: string; path: string }>;

  const cdsNavItems = [
    {
      key: '/admin/cds/dashboard',
      icon: <DashboardOutlined />,
      label: 'T?ng quan',
      path: '/admin/cds/dashboard',
    },
    {
      key: '/admin/cds/evaluations',
      icon: <FundProjectionScreenOutlined />,
      label: 'Phi?u',
      path: '/admin/cds/evaluations',
    },
    canManageCms && {
      key: '/admin/cms',
      icon: <FileTextOutlined />,
      label: 'CMS',
      path: '/admin/cms',
    },
  ].filter(Boolean) as Array<{ key: string; icon: React.ReactNode; label: string; path: string }>;

  const navItems = isCdsApp ? cdsNavItems : qlhsNavItems;

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
        boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: location.pathname === item.path ? '#1677ff' : '#8c8c8c',
              transition: 'color 0.3s',
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
