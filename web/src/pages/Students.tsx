import React, { useState } from 'react';
import { Table, Button, Input, Space, Card, Tag, Popconfirm, message, Tooltip, Statistic, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, UserOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layDanhSachHocSinh, taoHocSinh, capNhatHocSinh, xoaHocSinh } from '../api/hoc-sinh';
import { TrangThaiHocSinh, GioiTinh } from '../types/hoc-sinh';
import type { HocSinh } from '../types/hoc-sinh';
import StudentModal from '../components/StudentModal';
import ImportModal from '../components/ImportModal';
import dayjs from 'dayjs';
import ClassSelect from '../components/ClassSelect';
import ExportButton from '../components/ExportButton';

const Students: React.FC = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [lop, setLop] = useState<string[]>([]);
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
            message.success('Đã thêm học sinh mới');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => capNhatHocSinh(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hoc-sinh'] });
            setIsModalVisible(false);
            message.success('Đã cập nhật thông tin học sinh');
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
    const canImport = canEdit;

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'ma_hoc_sinh',
            key: 'ma_hoc_sinh',
            fixed: 'left' as const,
            width: 100,
            sorter: (a: any, b: any) => a.ma_hoc_sinh.localeCompare(b.ma_hoc_sinh),
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_ten',
            key: 'ho_ten',
            fixed: 'left' as const,
            width: 180,
            ellipsis: true,
            sorter: (a: any, b: any) => a.ho_ten.localeCompare(b.ho_ten),
        },
        {
            title: 'Lớp',
            dataIndex: 'lop',
            key: 'lop',
            width: 90,
            sorter: (a: any, b: any) => a.lop.localeCompare(b.lop),
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'ngay_sinh',
            key: 'ngay_sinh',
            width: 110,
            render: (ngay_sinh: string) => ngay_sinh ? dayjs(ngay_sinh).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gioi_tinh',
            key: 'gioi_tinh',
            width: 100,
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
            width: 110,
            sorter: (a: any, b: any) => a.trang_thai.localeCompare(b.trang_thai),
            render: (trang_thai: TrangThaiHocSinh) => (
                <Tag color={trang_thai === TrangThaiHocSinh.DANG_HOC ? 'success' : 'error'}>
                    {trang_thai === TrangThaiHocSinh.DANG_HOC ? 'Đang học' : 'Đã nghỉ'}
                </Tag>
            ),
        },
        {
            title: 'Cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
            responsive: ['md'] as any,
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Người thực hiện',
            dataIndex: ['nguoi_cap_nhat', 'ho_ten'],
            key: 'updatedBy',
            width: 150,
            responsive: ['lg'] as any,
            render: (text: string) => text || '-',
        },
    ];

    if (canEdit) {
        columns.push({
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 100,
            render: (_: any, record: HocSinh) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
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
                            size="small"
                            icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                        />
                    </Popconfirm>
                </Space>
            ),
        } as any);
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Tổng học sinh"
                            value={data?.total || 0}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Đang học"
                            value={data?.data?.filter((s: any) => s.trang_thai === TrangThaiHocSinh.DANG_HOC).length || 0}
                            valueStyle={{ color: '#3fafff' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="Đã nghỉ"
                            value={data?.data?.filter((s: any) => s.trang_thai === TrangThaiHocSinh.DA_NGHI).length || 0}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<StopOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Danh sách học sinh" size="small" extra={
                <Space wrap>
                    {canImport && (
                        <Tooltip title="Import từ CSV">
                            <Button icon={<FileTextOutlined />} onClick={() => setIsImportModalVisible(true)} />
                        </Tooltip>
                    )}
                    <ExportButton
                        endpoint="/hoc-sinh/export"
                        filename={`danh_sach_hoc_sinh_${dayjs().format('YYYYMMDD')}.csv`}
                        params={{ search: searchText, lop: lop.join(',') }}
                    />
                    {canEdit && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Thêm học sinh
                        </Button>
                    )}
                </Space>
            }>
                <div className="responsive-toolbar">
                    <Input
                        placeholder="Tìm kiếm theo tên, mã HS..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <ClassSelect
                        style={{ minWidth: 200 }}
                        value={lop}
                        mode="multiple"
                        onChange={(value) => setLop(value as string[])}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={data?.data}
                    rowKey="id"
                    loading={isLoading}
                    size="small"
                    scroll={{ x: 1000 }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: '8px 40px' }}>
                                <p><b>Địa chỉ:</b> {record.dia_chi || '-'}, {record.phuong_xa || '-'}, {record.quan_huyen || '-'}, {record.tinh || '-'}</p>
                                <p><b>Số điện thoại:</b> {record.so_dien_thoai || '-'}</p>
                                <p><b>Ngân hàng:</b> {record.ngan_hang || '-'} - {record.so_tai_khoan || '-'}</p>
                                <p className="mobile-only"><b>Người cập nhật:</b> {record.nguoi_cap_nhat?.ho_ten || '-'}</p>
                                <p className="mobile-only"><b>Ngày cập nhật:</b> {record.updatedAt ? dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</p>
                            </div>
                        ),
                        rowExpandable: () => true,
                    }}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: data?.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} mục`,
                        onChange: (p, ps) => {
                            setPage(p);
                            setPageSize(ps);
                        },
                    }}
                />
            </Card>

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
        </Space >
    );
};

export default Students;
