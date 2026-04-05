import React from 'react';
import { Card, notification, Typography, Space } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../api/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const { token, user } = await googleLogin(credentialResponse.credential);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            notification.success({
                message: 'Đăng nhập thành công',
                placement: 'top'
            });
            navigate(searchParams.get('from') || (user?.vai_tro === 'EDITOR' ? '/admin/cms' : '/admin'));
        } catch (error: any) {
            console.error('Login error:', error);
            const errorData = error.response?.data;
            const status = error.response?.status;
            const apiUrl = error.config?.url;
            const apiBaseUrl = error.config?.baseURL;
            const errorMsg = errorData?.details || errorData?.message || error.message || 'Lỗi không xác định';

            notification.error({
                message: 'Đăng nhập thất bại',
                description: (
                    <div style={{ fontSize: '12px' }}>
                        <p><strong>Lỗi:</strong> {errorMsg}</p>
                        {status && <p><strong>Status:</strong> {status}</p>}
                        {apiBaseUrl && <p><strong>Base URL:</strong> {apiBaseUrl}</p>}
                        {apiUrl && <p><strong>API:</strong> {apiUrl}</p>}
                        <p style={{ marginTop: '8px', color: '#888' }}>Mở Console (F12) để xem chi tiết Object.</p>
                    </div>
                ),
                duration: 0, // Stay open until closed manually
                placement: 'top'
            });
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #1890ff 0%, #001529 100%)'
        }}>
            <Card
                style={{ width: '90%', maxWidth: 400, textAlign: 'center', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            >
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>QLHS DTNT</Title>
                        <Text type="secondary">Hệ thống Quản lý học sinh Nội trú</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => notification.error({
                                message: 'Google Sign-In failed',
                                description: 'Không thể kết nối với dịch vụ xác thực của Google.',
                                placement: 'top'
                            })}
                            theme="filled_blue"
                            shape="pill"
                        />
                    </div>

                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Vui lòng sử dụng tài khoản Google của tổ chức để đăng nhập
                    </Text>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
