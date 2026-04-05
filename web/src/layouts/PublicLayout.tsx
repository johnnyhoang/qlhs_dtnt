import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout, Menu, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getPublishedMenus } from '../api/cms';
import { buildPublicMenuItems } from '../components/cms/cms-menu.util';

const { Header, Content, Footer } = Layout;

const PublicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'menus'],
    queryFn: getPublishedMenus,
    retry: false,
  });

  const items = buildPublicMenuItems(data || []);

  const onClick: MenuProps['onClick'] = ({ key }) => {
    navigate(String(key));
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f6f1e8' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(255,248,237,0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #eadfcb',
          paddingInline: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div style={{ minWidth: 220, color: '#2d3b36', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Cong thong tin DTNT
        </div>
        {isLoading ? (
          <Spin size="small" />
        ) : (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={onClick}
            style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none' }}
          />
        )}
      </Header>
      <Content style={{ padding: '32px 20px' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#2d3b36', color: '#f7f1e3' }}>
        He thong CMS cong khai danh cho quan ly hoc sinh va chuyen doi so
      </Footer>
    </Layout>
  );
};

export default PublicLayout;
