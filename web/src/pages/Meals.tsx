import React, { useState } from 'react';
import { Table, Card, DatePicker, Input, Checkbox, Space, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { layTrangThaiSuatAn, baoCatSuatAn } from '../api/suat-an';
import { LoaiSuatAn } from '../types/suat-an';
import type { HocSinhSuatAnStatus } from '../types/suat-an';

const Meals: React.FC = () => {
    const [ngay, setNgay] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchText, setSearchText] = useState('');
    const [lop, setLop] = useState('');

    const queryClient = useQueryClient();

    const { data: hoc_sinh_list, isLoading } = useQuery({
        queryKey: ['suat-an', ngay, lop, searchText],
        queryFn: () => layTrangThaiSuatAn({ ngay, lop, search: searchText }),
    });

    const toggleMutation = useMutation({
        mutationFn: baoCatSuatAn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suat-an'] });
        },
        onError: (err: any) => {
            message.error(err.response?.data?.message || 'Lỗi cập nhật');
        }
    });

    const handleToggle = (hoc_sinh_id: string, loai_suat_an: LoaiSuatAn, bao_cat: boolean) => {
        toggleMutation.mutate({
            hoc_sinh_id,
            ngay,
            loai_suat_an,
            bao_cat
        });
    };

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
            width: 100,
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
        },
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            width: 100,
        },
        {
            title: 'Báo cắt Sáng',
            key: 'sang',
            render: (_: any, record: HocSinhSuatAnStatus) => (
                <Checkbox
                    checked={record.suat_an.SANG}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.SANG, e.target.checked)}
                />
            ),
            align: 'center' as const,
        },
        {
            title: 'Báo cắt Trưa',
            key: 'trua',
            render: (_: any, record: HocSinhSuatAnStatus) => (
                <Checkbox
                    checked={record.suat_an.TRUA}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.TRUA, e.target.checked)}
                />
            ),
            align: 'center' as const,
        },
        {
            title: 'Báo cắt Tối',
            key: 'toi',
            render: (_: any, record: HocSinhSuatAnStatus) => (
                <Checkbox
                    checked={record.suat_an.TOI}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.TOI, e.target.checked)}
                />
            ),
            align: 'center' as const,
        },
        {
            title: 'Ghi chú',
            key: 'ghi_chu',
            render: (_: any, record: HocSinhSuatAnStatus) => (
                <Input
                    defaultValue={record.suat_an.ghi_chu}
                    onBlur={(e) => {
                        if (e.target.value !== record.suat_an.ghi_chu) {
                            toggleMutation.mutate({
                                hoc_sinh_id: record.id,
                                ngay,
                                loai_suat_an: LoaiSuatAn.SANG,
                                bao_cat: record.suat_an.SANG,
                                ghi_chu: e.target.value
                            });
                        }
                    }}
                />
            ),
        }
    ];

    return (
        <Card title="Quản lý báo cắt cơm">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <DatePicker
                        value={dayjs(ngay)}
                        onChange={(d) => setNgay(d ? d.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))}
                        format="DD/MM/YYYY"
                        allowClear={false}
                    />
                    <Input
                        placeholder="Tìm kiếm học sinh..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Input
                        placeholder="Lớp..."
                        onChange={(e) => setLop(e.target.value)}
                        style={{ width: 120 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={hoc_sinh_list}
                    rowKey="id"
                    loading={isLoading || toggleMutation.isPending}
                    pagination={false}
                    scroll={{ y: 600 }}
                />
            </Space>
        </Card>
    );
};

export default Meals;
