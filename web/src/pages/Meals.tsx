import React, { useState } from 'react';
import { Table, Card, DatePicker, Input, Checkbox, Space, message, Button } from 'antd';
import { SearchOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { layTrangThaiSuatAn, baoCatSuatAn } from '../api/suat-an';
import { LoaiSuatAn } from '../types/suat-an';
import type { HocSinhSuatAnStatus } from '../types/suat-an';
import ImportModal from '../components/ImportModal';

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

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'suat-an' && p.co_quyen_sua);
    const canImport = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'nhap-lieu' && p.co_quyen_sua);

    const handleToggle = (hoc_sinh_id: string, loai_suat_an: LoaiSuatAn, bao_cat: boolean, ghi_chu?: string) => {
        if (!canEdit) return;
        toggleMutation.mutate({
            hoc_sinh_id,
            ngay,
            loai_suat_an,
            bao_cat,
            ghi_chu
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
                    disabled={!canEdit}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.SANG, e.target.checked, record.suat_an.ghi_chu)}
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
                    disabled={!canEdit}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.TRUA, e.target.checked, record.suat_an.ghi_chu)}
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
                    disabled={!canEdit}
                    onChange={(e) => handleToggle(record.id, LoaiSuatAn.TOI, e.target.checked, record.suat_an.ghi_chu)}
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
                    disabled={!canEdit}
                    onBlur={(e) => {
                        if (e.target.value !== record.suat_an.ghi_chu) {
                            handleToggle(record.id, LoaiSuatAn.SANG, record.suat_an.SANG, e.target.value);
                        }
                    }}
                />
            ),
        },
        {
            title: 'Ngày cập nhật',
            key: 'updatedAt',
            width: 150,
            render: (_: any, record: HocSinhSuatAnStatus) => record.suat_an.lastUpdated ? dayjs(record.suat_an.lastUpdated).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Người cập nhật',
            key: 'updatedBy',
            width: 150,
            render: (_: any, record: HocSinhSuatAnStatus) => record.suat_an.updatedBy || '-',
        }
    ];

    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    return (
        <Card
            title="Quản lý báo cắt cơm"
            extra={
                canImport && (
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={() => setIsImportModalVisible(true)}
                    >
                        Import CSV
                    </Button>
                )
            }
        >
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

            <ImportModal
                visible={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['suat-an'] });
                    setIsImportModalVisible(false);
                }}
                title="Import danh sách báo cắt cơm"
                endpoint="/nhap-lieu/suat-an-csv"
                description="Hệ thống sẽ cập nhật trạng thái báo cắt cơm cho học sinh theo ngày hiện tại. File CSV cần có cột: 'ma_hoc_sinh', 'loai' (Sáng/Trưa/Tối), 'bao_cat' (1=Cắt, 0=Không)."
                additionalFields={{ ngay }}
            />
        </Card>
    );
};

export default Meals;
