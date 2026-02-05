import React from 'react';
import { Card, message, Typography, Space } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const { token, user } = await googleLogin(credentialResponse.credential);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            message.success('Đăng nhập thành công');
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            message.error(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
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
                style={{ width: 400, textAlign: 'center', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>QLHS DTNT</Title>
                        <Text type="secondary">Hệ thống Quản lý học sinh Nội trú</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => message.error('Google Sign-In failed')}
                            useOneTap
                            theme="filled_blue"
                            shape="pill"
                            text="continue_with"
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
