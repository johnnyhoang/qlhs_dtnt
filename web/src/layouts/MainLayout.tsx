import React from 'react';
import { Layout, Menu, Button, Avatar, Space, Typography } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    TableOutlined,
    LogoutOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
    DollarCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const hasAccess = (moduleName: string) => {
        if (user?.vai_tro === 'ADMIN') return true;
        return user?.quyen?.some((p: any) => p.ma_module === moduleName && p.co_quyen_xem);
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Bảng điều khiển',
            onClick: () => navigate('/')
        },
        hasAccess('hoc-sinh') && {
            key: '/hoc-sinh',
            icon: <UserOutlined />,
            label: 'Học sinh',
            onClick: () => navigate('/hoc-sinh')
        },
        hasAccess('suat-an') && {
            key: '/suat-an',
            icon: <TableOutlined />,
            label: 'Suất ăn',
            onClick: () => navigate('/suat-an')
        },
        hasAccess('dinh-muc-xe') && {
            key: '/dinh-muc-xe',
            icon: <CarOutlined />,
            label: 'Định mức xe',
            onClick: () => navigate('/dinh-muc-xe')
        },
        hasAccess('bao-hiem') && {
            key: '/bao-hiem',
            icon: <SafetyCertificateOutlined />,
            label: 'Bảo hiểm',
            onClick: () => navigate('/bao-hiem')
        },
        hasAccess('thanh-toan') && {
            key: '/thanh-toan',
            icon: <DollarCircleOutlined />,
            label: 'Thanh toán',
            onClick: () => navigate('/thanh-toan')
        },
        user?.vai_tro === 'ADMIN' && {
            key: '/nguoi-dung',
            icon: <TeamOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate('/nguoi-dung')
        }
    ].filter(Boolean);

    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Sider collapsible breakpoint="lg">
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    QLHS DTNT
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout className="site-layout">
                <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div />
                    <Space size="large">
                        <Space>
                            <Avatar src={user?.anh_dai_dien} icon={<UserOutlined />} />
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 'normal' }}>
                                <Text strong>{user?.ho_ten}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>{user?.vai_tro}</Text>
                            </div>
                        </Space>
                        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </Space>
                </Header>
                <Content style={{ margin: '0', background: '#f0f2f5' }}>
                    <div style={{ padding: '24px', minHeight: 'calc(100vh - 64px)', background: '#fff' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
