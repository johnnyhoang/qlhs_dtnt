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

type BackofficeGroupKey = 'public' | 'qlhs' | 'cds' | 'admin';
type MenuItemList = NonNullable<MenuProps['items']>;

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

  const qlhsMenuItems = [
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
  ].filter(Boolean) as MenuItemList;

  const cdsMenuItems = (hasAccess('cds') ? [
    {
      key: '/admin/cds/dashboard',
      icon: <FundProjectionScreenOutlined />,
      label: 'Dashboard CDS',
    },
    {
      key: '/admin/cds/evaluations',
      icon: <FileTextOutlined />,
      label: 'Danh s\u00e1ch phi\u1ebfu',
    },
    user?.vai_tro === 'ADMIN' ? {
      key: '/admin/cds/admin/periods',
      icon: <TableOutlined />,
      label: 'K\u1ef3 \u0111\u00e1nh gi\u00e1',
    } : null,
  ].filter(Boolean) : []) as MenuItemList;

  const adminMenuItems = [
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
  ].filter(Boolean) as MenuItemList;

  const currentGroup: BackofficeGroupKey = location.pathname.startsWith('/admin/cds')
    ? 'cds'
    : ['/admin/cms', '/admin/danh-muc-master', '/admin/nguoi-dung'].some((path) => location.pathname.startsWith(path))
      ? 'admin'
      : 'qlhs';

  const activeMenuItems = currentGroup === 'cds'
    ? cdsMenuItems
    : currentGroup === 'admin'
      ? adminMenuItems
      : qlhsMenuItems;

  const selectedKey = activeMenuItems?.some((item: any) => item?.key === location.pathname)
    ? location.pathname
    : currentGroup === 'cds'
      ? '/admin/cds/dashboard'
      : currentGroup === 'admin'
        ? String((adminMenuItems?.[0] as any)?.key || '/admin/cms')
        : '/admin';

  const groupDestinations: Record<Exclude<BackofficeGroupKey, 'public'>, string> = {
    qlhs: '/admin',
    cds: '/admin/cds/dashboard',
    admin: canManageCms ? '/admin/cms' : (user?.vai_tro === 'ADMIN' ? '/admin/danh-muc-master' : '/admin'),
  };

  const parentGroups = [
    {
      key: 'public' as const,
      label: 'C\u00f4ng khai',
      onClick: () => navigate('/'),
    },
    {
      key: 'qlhs' as const,
      label: 'QLHS',
      onClick: () => navigate(groupDestinations.qlhs),
    },
    hasAccess('cds') && {
      key: 'cds' as const,
      label: 'CDS',
      onClick: () => navigate(groupDestinations.cds),
    },
    adminMenuItems.length > 0 && {
      key: 'admin' as const,
      label: 'Admin',
      onClick: () => navigate(groupDestinations.admin),
    },
  ].filter(Boolean) as Array<{ key: BackofficeGroupKey; label: string; onClick: () => void }>;

  const currentGroupTitle = currentGroup === 'cds'
    ? 'Chuy\u1ec3n \u0111\u1ed5i s\u1ed1'
    : currentGroup === 'admin'
      ? 'Qu\u1ea3n tr\u1ecb h\u1ec7 th\u1ed1ng'
      : 'Qu\u1ea3n l\u00fd h\u1ecdc sinh';

  return (
    <Layout className="app-shell app-shell--admin">
      <SiteHero compact />
      <div className="backoffice-group-nav">
        <div className="backoffice-group-nav__inner">
          <div className="backoffice-group-nav__list">
            {parentGroups.map((group) => {
              const isActive = group.key !== 'public' && group.key === currentGroup;
              return (
                <Button
                  key={group.key}
                  type={isActive ? 'primary' : 'default'}
                  className={isActive ? 'backoffice-group-nav__button backoffice-group-nav__button--active' : 'backoffice-group-nav__button'}
                  onClick={group.onClick}
                >
                  {group.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      <TopNavigation
        title={currentGroupTitle}
        items={activeMenuItems}
        selectedKeys={[selectedKey]}
        onClick={({ key }) => navigate(String(key))}
        rightContent={(
          <Space size="middle" wrap>
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
