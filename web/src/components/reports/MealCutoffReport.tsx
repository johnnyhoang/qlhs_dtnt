import React from 'react';
import { Table, Tag, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { layThongKeSuatAnCatTheoLopVaNgay } from '../../api/thong-ke';
import type { MealCutoffByClass } from '../../types/thong-ke';

interface MealCutoffReportProps {
    startDate: string;
    endDate: string;
}

const MealCutoffReport: React.FC<MealCutoffReportProps> = ({ startDate, endDate }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['thong-ke-suat-an-cat', startDate, endDate],
        queryFn: () => layThongKeSuatAnCatTheoLopVaNgay(startDate, endDate),
        enabled: !!startDate && !!endDate
    });

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
    }

    if (!data) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Không có dữ liệu</div>;
    }

    // Helper to get color based on cut count
    const getCutColor = (count: number) => {
        if (count === 0) return '#52c41a'; // Green
        if (count <= 5) return '#faad14'; // Yellow
        return '#f5222d'; // Red
    };

    // Helper to format date to day of week
    const getDayOfWeek = (dateStr: string) => {
        const date = new Date(dateStr);
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
    };

    // Build columns
    const columns: any[] = [
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            fixed: 'left',
            width: 100,
            render: (lop: string, record: MealCutoffByClass) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{lop}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {record.total_students} HS
                    </div>
                </div>
            )
        },
        ...data.dates.map(date => ({
            title: (
                <div style={{ textAlign: 'center' }}>
                    <div>{getDayOfWeek(date)}</div>
                    <div style={{ fontSize: '11px', fontWeight: 'normal' }}>
                        {new Date(date).getDate()}/{new Date(date).getMonth() + 1}
                    </div>
                </div>
            ),
            key: date,
            width: 120,
            render: (_: any, record: MealCutoffByClass) => {
                const dayData = record.days[date];
                if (!dayData) return '-';

                const total = dayData.sang + dayData.trua + dayData.toi;

                return (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '4px' }}>
                            <Tag color={getCutColor(total)} style={{ margin: 0 }}>
                                Tổng: {total}
                            </Tag>
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            S:{dayData.sang} | T:{dayData.trua} | Tối:{dayData.toi}
                        </div>
                    </div>
                );
            }
        }))
    ];

    return (
        <div>
            <div style={{ marginBottom: '16px', color: '#666' }}>
                <strong>Ghi chú:</strong> S = Sáng, T = Trưa, Tối = Tối |
                <Tag color="success" style={{ marginLeft: '8px' }}>0 cắt</Tag>
                <Tag color="warning">1-5 cắt</Tag>
                <Tag color="error">&gt;5 cắt</Tag>
            </div>
            <Table
                columns={columns}
                dataSource={data.data}
                rowKey="lop"
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
                bordered
            />
        </div>
    );
};

export default MealCutoffReport;
