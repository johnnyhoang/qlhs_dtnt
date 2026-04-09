import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Layout, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getPublishedMenus } from '../api/cms';
import { buildPublicMenuItems, resolveNavigationSelectedKey } from '../components/cms/cms-menu.util';
import SiteHero from '../components/chrome/SiteHero';
import TopNavigation from '../components/chrome/TopNavigation';

const { Content, Footer } = Layout;

const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'menus'],
    queryFn: getPublishedMenus,
    retry: false,
  });

  const items = buildPublicMenuItems(data || [], true, user);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    navigate(String(key));
  };

  const navigation = (
    <TopNavigation
      items={items}
      selectedKeys={[resolveNavigationSelectedKey(location.pathname)]}
      onClick={onClick}
      rightContent={(
        <Button
          type="text"
          icon={<LoginOutlined />}
          className="top-nav__system-button"
          aria-label={userJson ? 'Vao he thong' : 'Dang nhap'}
          onClick={() => navigate(userJson ? '/admin' : '/admin/login')}
        />
      )}
    />
  );

  return (
    <Layout className="app-shell">
      <SiteHero compact={isLoginPage} navigation={navigation} />
      <Content className="app-shell__content">
        <div className="app-shell__container">
          {isLoading && !isLoginPage ? (
            <div className="page-loading">
              <Spin size="large" />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </Content>
      <Footer className="app-shell__footer">
        Truong Pho thong Dan toc Noi tru THCS-THPT tinh Lam Dong - Cong thong tin dien tu va he thong quan tri - So 02 Huyen Tran Cong Chua, P4, Da Lat, Lam Dong - 02633 822 160
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
