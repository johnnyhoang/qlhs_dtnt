import React from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography, Grid } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  FundProjectionScreenOutlined,
  TableOutlined,
  LogoutOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
  TeamOutlined,
  DatabaseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const hasAccess = (moduleName: string) => {
    if (user?.vai_tro === 'ADMIN') return true;
    return user?.danh_sach_quyen?.some((permission: any) => permission.ma_module === moduleName && permission.co_quyen_xem);
  };

  const isCdsApp = location.pathname.startsWith('/admin/cds');
  const canManageCms = user?.vai_tro === 'ADMIN' || user?.vai_tro === 'EDITOR';

  const qlhsMenuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'B?ng di?u khi?n',
      onClick: () => navigate('/admin'),
    },
    hasAccess('hoc-sinh') && {
      key: '/admin/hoc-sinh',
      icon: <UserOutlined />,
      label: 'H?c sinh',
      onClick: () => navigate('/admin/hoc-sinh'),
    },
    hasAccess('suat-an') && {
      key: '/admin/suat-an',
      icon: <TableOutlined />,
      label: 'Su?t an',
      onClick: () => navigate('/admin/suat-an'),
    },
    hasAccess('dinh-muc-xe') && {
      key: '/admin/dinh-muc-xe',
      icon: <CarOutlined />,
      label: 'Ð?nh m?c xe',
      onClick: () => navigate('/admin/dinh-muc-xe'),
    },
    hasAccess('bao-hiem') && {
      key: '/admin/bao-hiem',
      icon: <SafetyCertificateOutlined />,
      label: 'B?o hi?m',
      onClick: () => navigate('/admin/bao-hiem'),
    },
    hasAccess('thanh-toan') && {
      key: '/admin/thanh-toan',
      icon: <DollarCircleOutlined />,
      label: 'Thanh toán',
      onClick: () => navigate('/admin/thanh-toan'),
    },
    canManageCms && {
      key: '/admin/cms',
      icon: <FileTextOutlined />,
      label: 'CMS',
      onClick: () => navigate('/admin/cms'),
    },
    user?.vai_tro === 'ADMIN' && {
      key: '/admin/danh-muc-master',
      icon: <DatabaseOutlined />,
      label: 'Danh m?c',
      onClick: () => navigate('/admin/danh-muc-master'),
    },
    user?.vai_tro === 'ADMIN' && {
      key: '/admin/nguoi-dung',
      icon: <TeamOutlined />,
      label: 'Qu?n lý ngu?i dùng',
      onClick: () => navigate('/admin/nguoi-dung'),
    },
  ].filter(Boolean);

  const cdsMenuItems = [
    {
      key: '/admin/cds/dashboard',
      icon: <DashboardOutlined />,
      label: 'T?ng quan CÐS',
      onClick: () => navigate('/admin/cds/dashboard'),
    },
    {
      key: '/admin/cds/evaluations',
      icon: <FundProjectionScreenOutlined />,
      label: 'Danh sách phi?u',
      onClick: () => navigate('/admin/cds/evaluations'),
    },
    canManageCms && {
      key: '/admin/cms',
      icon: <FileTextOutlined />,
      label: 'CMS',
      onClick: () => navigate('/admin/cms'),
    },
    user?.vai_tro === 'ADMIN' && {
      key: '/admin/cds/admin/periods',
      icon: <DatabaseOutlined />,
      label: 'Qu?n lý K? dánh giá',
      onClick: () => navigate('/admin/cds/admin/periods'),
    },
  ].filter(Boolean);

  const menuItems = isCdsApp ? cdsMenuItems : qlhsMenuItems;

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      {!screens.xs && (
        <Sider collapsible breakpoint="lg">
          <div
            style={{
              height: 32,
              margin: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {isCdsApp ? 'MODULE CDS' : 'QLHS DTNT'}
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
        </Sider>
      )}
      <Layout className="site-layout">
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {hasAccess('cds') && (
              <Button
                type="primary"
                ghost
                icon={isCdsApp ? <TableOutlined /> : <FundProjectionScreenOutlined />}
                onClick={() => navigate(isCdsApp ? '/admin' : '/admin/cds/dashboard')}
              >
                {!screens.xs && (isCdsApp ? ' Tr? l?i Qu?n lý h?c sinh' : ' Chuy?n sang CÐS')}
              </Button>
            )}
          </div>
          <Space size={screens.xs ? 'small' : 'large'}>
            <Space>
              <Avatar src={user?.anh_dai_dien} icon={<UserOutlined />} />
              {screens.sm && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 'normal' }}>
                  <Text strong>{user?.ho_ten}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{user?.vai_tro}</Text>
                </div>
              )}
            </Space>
            <Button icon={<LogoutOutlined />} onClick={handleLogout} title="Ðang xu?t">
              {screens.sm && 'Ðang xu?t'}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '0', background: '#f0f2f5' }}>
          <div
            className="site-layout-content"
            style={{
              padding: screens.xs ? '12px' : '24px',
              minHeight: 'calc(100vh - 64px)',
              background: '#fff',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
      <BottomNav hasAccess={hasAccess} canManageCms={canManageCms} />
    </Layout>
  );
};

export default MainLayout;
