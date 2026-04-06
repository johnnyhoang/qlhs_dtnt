import React from 'react';
import { Avatar, Button, Card, Layout, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  CarOutlined,
  TableOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SiteHero from '../components/chrome/SiteHero';
import TopNavigation from '../components/chrome/TopNavigation';

const { Content, Footer } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
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

  const canManageCms = user?.vai_tro === 'ADMIN' || user?.vai_tro === 'EDITOR';

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'T\u1ed5ng quan',
    },
    hasAccess('hoc-sinh') && {
      key: '/admin/hoc-sinh',
      icon: <UserOutlined />,
      label: 'Qu\u1ea3n l\u00fd h\u1ecdc sinh',
    },
    hasAccess('suat-an') && {
      key: '/admin/suat-an',
      icon: <TableOutlined />,
      label: 'Su\u1ea5t \u0103n',
    },
    hasAccess('dinh-muc-xe') && {
      key: '/admin/dinh-muc-xe',
      icon: <CarOutlined />,
      label: '\u0110\u1ecbnh m\u1ee9c xe',
    },
    hasAccess('bao-hiem') && {
      key: '/admin/bao-hiem',
      icon: <SafetyCertificateOutlined />,
      label: 'B\u1ea3o hi\u1ec3m',
    },
    hasAccess('thanh-toan') && {
      key: '/admin/thanh-toan',
      icon: <DollarCircleOutlined />,
      label: 'Thanh to\u00e1n',
    },
    hasAccess('cds') && {
      key: 'cds-group',
      icon: <FundProjectionScreenOutlined />,
      label: 'Chuy\u1ec3n \u0111\u1ed5i s\u1ed1',
      children: [
        { key: '/admin/cds/dashboard', label: 'Dashboard CDS' },
        { key: '/admin/cds/evaluations', label: 'Danh s\u00e1ch phi\u1ebfu' },
        user?.vai_tro === 'ADMIN' ? { key: '/admin/cds/admin/periods', label: 'K\u1ef3 \u0111\u00e1nh gi\u00e1' } : null,
      ].filter(Boolean),
    },
    canManageCms && {
      key: '/admin/cms',
      icon: <FileTextOutlined />,
      label: 'CMS',
    },
    user?.vai_tro === 'ADMIN' && {
      key: '/admin/danh-muc-master',
      icon: <DatabaseOutlined />,
      label: 'Danh m\u1ee5c',
    },
    user?.vai_tro === 'ADMIN' && {
      key: '/admin/nguoi-dung',
      icon: <TeamOutlined />,
      label: 'Ng\u01b0\u1eddi d\u00f9ng',
    },
  ].filter(Boolean);

  const selectedKey = menuItems?.some((item: any) => item?.key === location.pathname)
    ? location.pathname
    : menuItems?.find((item: any) => item?.children?.some((child: any) => child?.key === location.pathname))
      ? location.pathname
      : '/admin';

  return (
    <Layout className="app-shell app-shell--admin">
      <SiteHero compact />
      <TopNavigation
        title={"H\u1ec7 th\u1ed1ng qu\u1ea3n tr\u1ecb"}
        items={menuItems}
        selectedKeys={[selectedKey]}
        onClick={({ key }) => navigate(String(key))}
        rightContent={(
          <Space size="middle" wrap>
            <Button onClick={() => navigate('/')}>{"Trang c\u00f4ng khai"}</Button>
            <Card size="small" className="user-chip-card">
              <Space size="small">
                <Avatar src={user?.anh_dai_dien} icon={<UserOutlined />} />
                <div className="user-chip-card__content">
                  <Text strong>{user?.ho_ten || 'Ng\u01b0\u1eddi d\u00f9ng'}</Text>
                  <div>
                    <Tag color="green">{user?.vai_tro || 'USER'}</Tag>
                  </div>
                </div>
              </Space>
            </Card>
            <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>
              {"\u0110\u0103ng xu\u1ea5t"}
            </Button>
          </Space>
        )}
      />
      <Content className="app-shell__content app-shell__content--admin">
        <div className="app-shell__container app-shell__container--wide">
          <div className="app-admin-panel">
            <Outlet />
          </div>
        </div>
      </Content>
      <Footer className="app-shell__footer">
        {"H\u1ec7 th\u1ed1ng qu\u1ea3n tr\u1ecb n\u1ed9i b\u1ed9 - Qu\u1ea3n l\u00fd h\u1ecdc sinh - Chuy\u1ec3n \u0111\u1ed5i s\u1ed1 - CMS"}
      </Footer>
    </Layout>
  );
};

export default MainLayout;
