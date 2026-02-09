import React from 'react';
import { Card, Row, Col, Statistic, Space } from 'antd';
import { UserOutlined, SmileOutlined, CarOutlined, DollarOutlined } from '@ant-design/icons';
import ReportTabs from '../components/reports/ReportTabs';

const Dashboard: React.FC = () => {
    return (
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <h1 style={{ marginBottom: 24 }}>Hệ thống Quản lý học sinh DTNT</h1>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Tổng số học sinh"
                            value={150}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Cắt cơm hôm nay"
                            value={12}
                            prefix={<SmileOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Hỗ trợ vận chuyển"
                            value={45}
                            prefix={<CarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Đợt chi trả gần nhất"
                            value="T5/2024"
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Báo cáo thống kê" style={{ marginTop: 24, width: '100%' }}>
                <ReportTabs />
            </Card>

            <Card title="Thông báo hệ thống" style={{ marginTop: 24, width: '100%' }}>
                <p>Hệ thống quản lý học sinh nội trú đã sẵn sàng hoạt động.</p>
                <p>Vui lòng cập nhật thông tin học sinh và báo cắt cơm hàng ngày.</p>
            </Card>
        </Space>
    );
};

export default Dashboard;
