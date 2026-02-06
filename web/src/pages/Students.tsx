import React, { useState } from 'react';
import { Table, Button, Input, Space, Card, Tag, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layDanhSachHocSinh, taoHocSinh, capNhatHocSinh, xoaHocSinh } from '../api/hoc-sinh';
import { TrangThaiHocSinh, GioiTinh } from '../types/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import StudentModal from '../components/StudentModal'; // Need to update this too
import ImportModal from '../components/ImportModal'; // Need to update this too
import dayjs from 'dayjs';

const Students: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [lop, setLop] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState<HocSinh | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['hoc-sinh', page, pageSize, searchText, lop],
        queryFn: () => layDanhSachHocSinh({ page, pageSize, search: searchText, lop }),
    });

    const createMutation = useMutation({
        mutationFn: taoHocSinh,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hoc-sinh'] });
            setIsModalVisible(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => capNhatHocSinh(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hoc-sinh'] });
            setIsModalVisible(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: xoaHocSinh,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hoc-sinh'] });
            message.success('Đã xóa học sinh');
        },
    });

    const handleAdd = () => {
        setEditingStudent(null);
        setIsModalVisible(true);
    };

    const handleEdit = (student: HocSinh) => {
        setEditingStudent(student);
        setIsModalVisible(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleSave = async (values: any) => {
        if (editingStudent) {
            await updateMutation.mutateAsync({ id: editingStudent.id, data: values });
        } else {
            await createMutation.mutateAsync(values);
        }
    };

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const canEdit = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'hoc-sinh' && p.co_quyen_sua);
    const canImport = user?.vai_tro === 'ADMIN' || user?.danh_sach_quyen?.some((p: any) => p.ma_module === 'nhap-lieu' && p.co_quyen_sua);

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
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
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'ngay_sinh',
            key: 'ngay_sinh',
            render: (ngay_sinh: string) => ngay_sinh ? dayjs(ngay_sinh).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gioi_tinh',
            key: 'gioi_tinh',
            render: (gioi_tinh: GioiTinh) => (
                <Tag color={gioi_tinh === GioiTinh.NAM ? 'blue' : gioi_tinh === GioiTinh.NU ? 'pink' : 'default'}>
                    {gioi_tinh === GioiTinh.NAM ? 'Nam' : gioi_tinh === GioiTinh.NU ? 'Nữ' : 'Khác'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (trang_thai: TrangThaiHocSinh) => (
                <Tag color={trang_thai === TrangThaiHocSinh.DANG_HOC ? 'success' : 'error'}>
                    {trang_thai === TrangThaiHocSinh.DANG_HOC ? 'Đang học' : 'Đã nghỉ'}
                </Tag>
            ),
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Người cập nhật',
            dataIndex: ['nguoi_cap_nhat', 'ho_ten'],
            key: 'updatedBy',
            render: (text: string) => text || '-',
        },
    ];

    if (canEdit) {
        columns.push({
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: HocSinh) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa học sinh này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Popconfirm>
                </Space>
            ),
        } as any);
    }

    return (
        <Card title="Quản lý học sinh" extra={
            <Space>
                {canImport && (
                    <Button icon={<FileExcelOutlined />} onClick={() => setIsImportModalVisible(true)}>
                        Import CSV
                    </Button>
                )}
                {canEdit && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm học sinh
                    </Button>
                )}
            </Space>
        }>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        placeholder="Tìm kiếm theo tên..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Input
                        placeholder="Lớp..."
                        onChange={(e) => setLop(e.target.value)}
                        style={{ width: 150 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={data?.data}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: data?.total,
                        onChange: (p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        },
                    }}
                />
            </Space>

            <StudentModal
                visible={isModalVisible}
                student={editingStudent}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={() => setIsModalVisible(false)}
                onSave={handleSave}
                loading={createMutation.isPending || updateMutation.isPending}
            />

            <ImportModal
                visible={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['hoc-sinh'] });
                    setIsImportModalVisible(false);
                }}
            />
        </Card>
    );
};

export default Students;
