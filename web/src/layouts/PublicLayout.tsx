import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Layout, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getPublishedMenus } from '../api/cms';
import { buildPublicMenuItems } from '../components/cms/cms-menu.util';
import SiteHero from '../components/chrome/SiteHero';
import TopNavigation from '../components/chrome/TopNavigation';

const { Content, Footer } = Layout;

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoginPage = location.pathname === '/admin/login';
    const userJson = localStorage.getItem('user');

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
        <Layout className="app-shell">
            <SiteHero compact={isLoginPage} />
            <TopNavigation
                title={"C\u1ed5ng th\u00f4ng tin DTNT"}
                items={items}
                selectedKeys={[location.pathname]}
                onClick={onClick}
                rightContent={(
                    <Button
                        type={userJson ? 'default' : 'primary'}
                        icon={<LoginOutlined />}
                        onClick={() => navigate(userJson ? '/admin' : '/admin/login')}
                    >
                        {userJson ? 'V\u00e0o h\u1ec7 th\u1ed1ng' : '\u0110\u0103ng nh\u1eadp'}
                    </Button>
                )}
            />
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
                {"Tr\u01b0\u1eddng Ph\u1ed5 th\u00f4ng D\u00e2n t\u1ed9c N\u1ed9i tr\u00fa THCS-THPT t\u1ec9nh L\u00e2m \u0110\u1ed3ng - C\u1ed5ng th\u00f4ng tin \u0111i\u1ec7n t\u1eed v\u00e0 h\u1ec7 th\u1ed1ng qu\u1ea3n tr\u1ecb"}
            </Footer>
        </Layout>
    );
};

export default PublicLayout;
