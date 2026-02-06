import React from 'react';
import { Table, Card, Row, Col, Statistic, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { layThongKeVanChuyenTheoLop } from '../../api/thong-ke';
import type { TransportStatsByClass } from '../../types/thong-ke';

interface TransportStatisticsReportProps {
    startDate?: string;
    endDate?: string;
}

const TransportStatisticsReport: React.FC<TransportStatisticsReportProps> = ({ startDate, endDate }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['thong-ke-van-chuyen', startDate, endDate],
        queryFn: () => layThongKeVanChuyenTheoLop(startDate, endDate)
    });

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Không có dữ liệu</div>;
    }

    const columns = [
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            sorter: (a: TransportStatsByClass, b: TransportStatsByClass) => a.lop.localeCompare(b.lop)
        },
        {
            title: 'Tổng HS',
            dataIndex: 'total_students',
            key: 'total_students',
            align: 'center' as const,
            sorter: (a: TransportStatsByClass, b: TransportStatsByClass) => a.total_students - b.total_students
        },
        {
            title: 'HS được hỗ trợ',
            dataIndex: 'students_with_support',
            key: 'students_with_support',
            align: 'center' as const,
            render: (count: number, record: TransportStatsByClass) => (
                <span>
                    {count} ({((count / record.total_students) * 100).toFixed(1)}%)
                </span>
            ),
            sorter: (a: TransportStatsByClass, b: TransportStatsByClass) => a.students_with_support - b.students_with_support
        },
        {
            title: 'Tổng khoảng cách (km)',
            dataIndex: 'total_distance',
            key: 'total_distance',
            align: 'right' as const,
            render: (distance: number) => distance.toFixed(1),
            sorter: (a: TransportStatsByClass, b: TransportStatsByClass) => a.total_distance - b.total_distance
        },
        {
            title: 'Tổng số tiền (VNĐ)',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right' as const,
            render: (amount: number) => amount.toLocaleString('vi-VN'),
            sorter: (a: TransportStatsByClass, b: TransportStatsByClass) => a.total_amount - b.total_amount
        }
    ];

    return (
        <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng học sinh"
                            value={data.summary.total_students}
                            suffix="HS"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="HS được hỗ trợ"
                            value={data.summary.total_with_support}
                            suffix={`/ ${data.summary.total_students}`}
                            valueStyle={{ color: '#3f8600' }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#888' }}>
                            {((data.summary.total_with_support / data.summary.total_students) * 100).toFixed(1)}%
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng khoảng cách"
                            value={data.summary.total_distance.toFixed(1)}
                            suffix="km"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi phí"
                            value={data.summary.total_amount}
                            suffix="VNĐ"
                            valueStyle={{ color: '#722ed1' }}
                            formatter={(value) => value.toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Chi tiết theo lớp">
                <Table
                    columns={columns}
                    dataSource={data.data}
                    rowKey="lop"
                    pagination={false}
                    size="small"
                    bordered
                />
            </Card>
        </div>
    );
};

export default TransportStatisticsReport;
