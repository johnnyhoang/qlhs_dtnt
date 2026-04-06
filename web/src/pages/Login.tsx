import React from 'react';
import { Card, Col, List, Row, notification, Space, Typography } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import { CheckCircleOutlined, LockOutlined, ReadOutlined } from '@ant-design/icons';
import { googleLogin } from '../api/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Paragraph, Text, Title } = Typography;

const LOGIN_FEATURES = [
    '\u0110\u0103ng nh\u1eadp m\u1ed9t l\u1ea7n b\u1eb1ng t\u00e0i kho\u1ea3n Google c\u1ee7a t\u1ed5 ch\u1ee9c',
    'Qu\u1ea3n tr\u1ecb menu, trang n\u1ed9i dung HTML/PDF v\u00e0 c\u00f4ng b\u1ed1 c\u00f4ng khai',
    'Truy c\u1eadp nhanh module Qu\u1ea3n l\u00fd h\u1ecdc sinh v\u00e0 Chuy\u1ec3n \u0111\u1ed5i s\u1ed1',
];

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const { token, user } = await googleLogin(credentialResponse.credential);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            notification.success({
                message: '\u0110\u0103ng nh\u1eadp th\u00e0nh c\u00f4ng',
                placement: 'top'
            });
            navigate(searchParams.get('from') || (user?.vai_tro === 'EDITOR' ? '/admin/cms' : '/admin'));
        } catch (error: any) {
            console.error('Login error:', error);
            const errorData = error.response?.data;
            const status = error.response?.status;
            const apiUrl = error.config?.url;
            const apiBaseUrl = error.config?.baseURL;
            const errorMsg = errorData?.details || errorData?.message || error.message || 'L\u1ed7i kh\u00f4ng x\u00e1c \u0111\u1ecbnh';

            notification.error({
                message: '\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i',
                description: (
                    <div style={{ fontSize: '12px' }}>
                        <p><strong>{"L\u1ed7i:"}</strong> {errorMsg}</p>
                        {status && <p><strong>Status:</strong> {status}</p>}
                        {apiBaseUrl && <p><strong>Base URL:</strong> {apiBaseUrl}</p>}
                        {apiUrl && <p><strong>API:</strong> {apiUrl}</p>}
                        <p style={{ marginTop: '8px', color: '#647067' }}>{"M\u1edf Console (F12) \u0111\u1ec3 xem chi ti\u1ebft object."}</p>
                    </div>
                ),
                duration: 0,
                placement: 'top'
            });
        }
    };

    return (
        <div className="login-page">
            <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={13}>
                    <div className="page-section-card page-section-card--hero">
                        <Text className="page-kicker">{"Khu v\u1ef1c qu\u1ea3n tr\u1ecb"}</Text>
                        <Title level={1} className="page-title">
                            {"\u0110\u0103ng nh\u1eadp h\u1ec7 th\u1ed1ng CMS v\u00e0 qu\u1ea3n tr\u1ecb n\u1ed9i b\u1ed9"}
                        </Title>
                        <Paragraph className="page-description">
                            {"H\u1ec7 th\u1ed1ng \u0111\u01b0\u1ee3c thi\u1ebft k\u1ebf mobile-first, th\u1ed1ng nh\u1ea5t giao di\u1ec7n cho c\u1ed5ng th\u00f4ng tin c\u00f4ng khai, CMS v\u00e0 hai module"}
                            {' '}
                            {"nghi\u1ec7p v\u1ee5 hi\u1ec7n c\u00f3. \u0110\u0103ng nh\u1eadp \u0111\u1ec3 qu\u1ea3n tr\u1ecb n\u1ed9i dung, menu v\u00e0 v\u1eadn h\u00e0nh c\u00e1c c\u00f4ng c\u1ee5 n\u1ed9i b\u1ed9."}
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
                                <Text className="page-kicker">Google Authentication</Text>
                                <Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
                                    {"\u0110\u0103ng nh\u1eadp b\u1eb1ng t\u00e0i kho\u1ea3n \u0111\u01b0\u1ee3c c\u1ea5p quy\u1ec1n"}
                                </Title>
                                <Paragraph style={{ marginBottom: 0 }}>
                                    {"Ch\u1ec9 t\u00e0i kho\u1ea3n \u0111\u01b0\u1ee3c g\u00e1n role `ADMIN` ho\u1eb7c `EDITOR` m\u1edbi truy c\u1eadp \u0111\u01b0\u1ee3c khu v\u1ef1c qu\u1ea3n tr\u1ecb."}
                                </Paragraph>
                            </div>

                            <div className="login-card__actions">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => notification.error({
                                        message: 'Google Sign-In failed',
                                        description: 'Kh\u00f4ng th\u1ec3 k\u1ebft n\u1ed1i v\u1edbi d\u1ecbch v\u1ee5 x\u00e1c th\u1ef1c c\u1ee7a Google.',
                                        placement: 'top'
                                    })}
                                    theme="filled_blue"
                                    shape="pill"
                                />
                            </div>

                            <div className="login-card__notes">
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Text><LockOutlined /> {"\u0110\u0103ng nh\u1eadp an to\u00e0n b\u1eb1ng OAuth Google."}</Text>
                                    <Text><ReadOutlined /> {"Sau khi \u0111\u0103ng nh\u1eadp, h\u1ec7 th\u1ed1ng s\u1ebd \u0111i\u1ec1u h\u01b0\u1edbng theo role v\u00e0 URL \u0111ang truy c\u1eadp."}</Text>
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
