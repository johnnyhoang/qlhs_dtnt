import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Button, Card, Layout, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  QuestionCircleOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getPublishedMenus } from '../api/cms';
import { buildPublicMenuItems, resolveNavigationSelectedKey } from '../components/cms/cms-menu.util';
import SiteHero from '../components/chrome/SiteHero';
import TopNavigation from '../components/chrome/TopNavigation';
import BackofficeHelpDrawer from '../components/help/BackofficeHelpDrawer';
import { resolveBackofficeHelp } from '../help/backoffice-help';

const { Content, Footer } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);

  const { data: publicMenus = [] } = useQuery({
    queryKey: ['cms', 'menus'],
    queryFn: getPublishedMenus,
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const items = buildPublicMenuItems(publicMenus);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    navigate(String(key));
  };

  const helpEntry = resolveBackofficeHelp(location.pathname);

  const navigation = (
    <TopNavigation
      items={items}
      selectedKeys={[resolveNavigationSelectedKey(location.pathname)]}
      onClick={onClick}
      rightContent={(
        <Space size="middle" wrap>
          <Button
            type="text"
            shape="circle"
            icon={<QuestionCircleOutlined />}
            aria-label="Open help"
            onClick={() => setIsHelpOpen(true)}
          />
          <Card size="small" className="user-chip-card">
            <Space size="small">
              <Avatar src={user?.anh_dai_dien} icon={<UserOutlined />} />
              <div className="user-chip-card__content">
                <Text strong>{user?.ho_ten || 'Nguoi dung'}</Text>
                <div>
                  <Tag color="green">{user?.vai_tro || 'USER'}</Tag>
                </div>
              </div>
            </Space>
          </Card>
          <Button icon={<LogoutOutlined />} danger onClick={handleLogout}>
            Dang xuat
          </Button>
        </Space>
      )}
    />
  );

  return (
    <Layout className="app-shell app-shell--admin">
      <SiteHero compact navigation={navigation} />
      <Content className="app-shell__content app-shell__content--admin">
        <div className="app-shell__container app-shell__container--wide">
          <div className="app-admin-panel">
            <Outlet />
          </div>
        </div>
      </Content>
      <Footer className="app-shell__footer">
        He thong quan tri noi bo - Quan ly hoc sinh - Chuyen doi so - CMS - So 02 Huyen Tran Cong Chua, P4, Da Lat, Lam Dong - 02633 822 160
      </Footer>
      <BackofficeHelpDrawer open={isHelpOpen} onClose={() => setIsHelpOpen(false)} entry={helpEntry} />
    </Layout>
  );
};

export default MainLayout;
