import React, { useState } from 'react';
import { Tabs, Space, Button, DatePicker, Typography } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import MealCutoffReport from './MealCutoffReport';
import MealStatisticsReport from './MealStatisticsReport';
import TransportStatisticsReport from './TransportStatisticsReport';

dayjs.extend(isoWeek);

const { Text } = Typography;

const ReportTabs: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('meal-cutoff');

    const startOfWeek = selectedDate.startOf('isoWeek');
    const endOfWeek = selectedDate.endOf('isoWeek');

    const handlePrevWeek = () => {
        setSelectedDate(selectedDate.subtract(1, 'week'));
    };

    const handleNextWeek = () => {
        setSelectedDate(selectedDate.add(1, 'week'));
    };

    const handleDateChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const items = [
        {
            key: 'meal-cutoff',
            label: 'Cắt phần ăn theo lớp/ngày',
            children: (
                <MealCutoffReport
                    startDate={startOfWeek.format('YYYY-MM-DD')}
                    endDate={endOfWeek.format('YYYY-MM-DD')}
                />
            )
        },
        {
            key: 'meal-monthly',
            label: 'Thống kê suất ăn theo tháng',
            children: (
                <MealStatisticsReport
                    month={selectedDate.month() + 1}
                    year={selectedDate.year()}
                />
            )
        },
        {
            key: 'transport',
            label: 'Thống kê hỗ trợ vận chuyển',
            children: (
                <TransportStatisticsReport
                    startDate={startOfWeek.format('YYYY-MM-DD')}
                    endDate={endOfWeek.format('YYYY-MM-DD')}
                />
            )
        }
    ];

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f5f5', padding: '12px 16px', borderRadius: '8px' }}>
                <Space size="middle">
                    <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
                    <DatePicker
                        picker="week"
                        value={selectedDate}
                        onChange={handleDateChange}
                        placeholder="Chọn tuần"
                        suffixIcon={<CalendarOutlined />}
                        format="[Tuần] ww/YYYY"
                    />
                    <Button icon={<RightOutlined />} onClick={handleNextWeek} />
                    <Text strong style={{ marginLeft: '8px' }}>
                        {startOfWeek.format('DD/MM/YYYY')} - {endOfWeek.format('DD/MM/YYYY')}
                    </Text>
                </Space>

                <Text type="secondary">
                    Dữ liệu báo cáo dựa trên thời gian đã chọn
                </Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                type="card"
            />
        </Space>
    );
};

export default ReportTabs;
