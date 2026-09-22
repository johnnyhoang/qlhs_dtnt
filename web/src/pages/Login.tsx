import React, { useState, useEffect } from 'react';
import { Card, Col, List, Row, notification, Space, Typography, Button, Spin } from 'antd';
import { CheckCircleOutlined, LockOutlined, ReadOutlined, GoogleOutlined } from '@ant-design/icons';
import { supabaseLogin } from '../api/auth';
import { supabase } from '../utils/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Paragraph, Text, Title } = Typography;

const LOGIN_FEATURES = [
    'Đăng nhập một lần bằng tài khoản Google của tổ chức',
    'Quản trị menu, trang nội dung HTML/PDF và công bố công khai',
    'Truy cập nhanh module Quản lý học sinh và Chuyển đổi số',
];

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                const currentToken = localStorage.getItem('token');
                const currentUser = localStorage.getItem('user');
                if (currentToken && currentUser) {
                    try {
                        const parsedUser = JSON.parse(currentUser);
                        navigate(searchParams.get('from') || (parsedUser?.vai_tro === 'EDITOR' ? '/admin/cms' : '/admin'));
                        return;
                    } catch {
                        // ignore parse error
                    }
                }

                try {
                    setIsLoggingIn(true);
                    const userMeta = session.user.user_metadata || {};
                    const { token, user } = await supabaseLogin(session.access_token, {
                        email: session.user.email!,
                        name: userMeta.full_name || userMeta.name || session.user.email,
                        avatar: userMeta.avatar_url,
                    });
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    notification.success({
                        message: 'Đăng nhập thành công',
                        placement: 'top'
                    });
                    navigate(searchParams.get('from') || (user?.vai_tro === 'EDITOR' ? '/admin/cms' : '/admin'));
                } catch (error: any) {
                    console.error('Session sync error:', error);
                    setIsLoggingIn(false);
                    const errorData = error.response?.data;
                    const errorMsg = errorData?.details || errorData?.message || error.message || 'Lỗi không xác định';

                    notification.error({
                        message: 'Đăng nhập thất bại',
                        description: (
                            <div style={{ fontSize: '12px' }}>
                                <p><strong>Lỗi:</strong> {errorMsg}</p>
                            </div>
                        ),
                        duration: 0,
                        placement: 'top'
                    });
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate, searchParams]);

    const handleGoogleLogin = async () => {
        try {
            setIsLoggingIn(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/admin/login`,
                },
            });
            if (error) {
                setIsLoggingIn(false);
                notification.error({
                    message: 'Đăng nhập Google thất bại',
                    description: error.message,
                    placement: 'top',
                });
            }
        } catch (error: any) {
            setIsLoggingIn(false);
            notification.error({
                message: 'Đăng nhập thất bại',
                description: error.message || 'Không thể kết nối dịch vụ xác thực Supabase.',
                placement: 'top',
            });
        }
    };

    return (
        <div className="login-page">
            <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={13}>
                    <div className="page-section-card page-section-card--hero">
                        <Text className="page-kicker">Khu vực quản trị</Text>
                        <Title level={1} className="page-title">
                            Đăng nhập hệ thống CMS và quản trị nội bộ
                        </Title>
                        <Paragraph className="page-description">
                            Hệ thống được thiết kế mobile-first, thống nhất giao diện cho cổng thông tin công khai, CMS và hai module
                            {' '}
                            nghiệp vụ hiện có. Đăng nhập để quản trị nội dung, menu và vận hành các công cụ nội bộ.
                        </Paragraph>
                        <List
                            className="login-feature-list"
                            dataSource={LOGIN_FEATURES}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space align="start">
                                        <CheckCircleOutlined className="login-feature-list__icon" />
                                        <Text>{item}</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>
                <Col xs={24} lg={11}>
                    <Card className="login-card" bordered={false}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <div>
                                <Text className="page-kicker">Supabase Authentication</Text>
                                <Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
                                    Đăng nhập bằng tài khoản được cấp quyền
                                </Title>
                                <Paragraph style={{ marginBottom: 0 }}>
                                    Chỉ tài khoản được gán role `ADMIN` hoặc `EDITOR` mới truy cập được khu vực quản trị.
                                </Paragraph>
                            </div>

                            <div className="login-card__actions">
                                {isLoggingIn ? (
                                    <Space direction="vertical" align="center" style={{ width: '100%', padding: '16px 0' }}>
                                        <Spin size="large" />
                                        <Text type="secondary">Đang đồng bộ phiên đăng nhập...</Text>
                                    </Space>
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<GoogleOutlined />}
                                        size="large"
                                        block
                                        onClick={handleGoogleLogin}
                                        style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                                    >
                                        Đăng nhập bằng Google
                                    </Button>
                                )}
                            </div>

                            <div className="login-card__notes">
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text><LockOutlined /> Đăng nhập an toàn qua Supabase Google OAuth.</Text>
                                    <Text><ReadOutlined /> Sau khi đăng nhập, hệ thống sẽ điều hướng theo role và URL đang truy cập.</Text>
                                </Space>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Login;
