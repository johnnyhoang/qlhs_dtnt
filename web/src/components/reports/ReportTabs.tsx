import React, { useState, useEffect } from 'react';
import { Tabs, Space, Button, DatePicker, Typography, Select } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import MealCutoffReport from './MealCutoffReport';
import MealStatisticsReport from './MealStatisticsReport';
import TransportStatisticsReport from './TransportStatisticsReport';
import { useAuth } from '../../contexts/AuthContext';
import { layDanhSachLop } from '../../api/hoc-sinh';

dayjs.extend(isoWeek);

const { Text } = Typography;
const { Option } = Select;

const ReportTabs: React.FC = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('meal-cutoff');
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [availableClasses, setAvailableClasses] = useState<string[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            if (user?.vai_tro === 'TEACHER') {
                setAvailableClasses(user.lop_phu_trach || []);
            } else {
                try {
                    const res = await layDanhSachLop();
                    setAvailableClasses(res);
                } catch (error) {
                    console.error("Lỗi lấy danh sách lớp", error);
                }
            }
        };
        fetchClasses();
    }, [user]);

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
                    classes={selectedClasses}
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
                    classes={selectedClasses}
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
                    classes={selectedClasses}
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

                <Space>
                    <Select
                        mode="multiple"
                        style={{ minWidth: 200 }}
                        placeholder="Lọc theo lớp (Tất cả)"
                        value={selectedClasses}
                        onChange={setSelectedClasses}
                        allowClear
                        maxTagCount="responsive"
                    >
                        {availableClasses.map(lop => (
                            <Option key={lop} value={lop}>{lop}</Option>
                        ))}
                    </Select>
                </Space>
            </div>

            <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {!selectedClasses.length ? "Đang hiển thị tất cả các lớp được phép" : `Đang lọc: ${selectedClasses.join(', ')}`}
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
