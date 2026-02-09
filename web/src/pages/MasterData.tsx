import React, { useState } from 'react';
import { Card, Tabs, Table, Button, Space, message, Popconfirm, Tag, Input, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layDanhSachDanhMuc, taoDanhMuc, capNhatDanhMuc, xoaDanhMuc } from '../api/danh-muc-master';
import { LoaiDanhMuc, TenLoaiDanhMuc } from '../types/danh-muc-master';
import type { DanhMucMaster, CreateDanhMucRequest } from '../types/danh-muc-master';
import MasterDataModal from '../components/MasterDataModal';
import ImportModal from '../components/ImportModal';

const MasterData: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>(LoaiDanhMuc.NOI_KHAM_BENH);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<DanhMucMaster | null>(null);

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['danh-muc-master', activeTab, searchText],
        queryFn: () => layDanhSachDanhMuc({
            loai_danh_muc: activeTab,
            search: searchText,
            pageSize: 1000
        }),
    });

    const createMutation = useMutation({
        mutationFn: taoDanhMuc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['danh-muc-master'] });
            setIsModalVisible(false);
            setEditingItem(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateDanhMucRequest }) =>
            capNhatDanhMuc(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['danh-muc-master'] });
            setIsModalVisible(false);
            setEditingItem(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: xoaDanhMuc,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['danh-muc-master'] });
            message.success('Đã xóa danh mục');
        },
    });

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalVisible(true);
    };

    const handleEdit = (item: DanhMucMaster) => {
        setEditingItem(item);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const handleSave = async (data: CreateDanhMucRequest) => {
        if (editingItem) {
            await updateMutation.mutateAsync({ id: editingItem.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Tên',
            dataIndex: 'ten',
            key: 'ten',
            sorter: (a: DanhMucMaster, b: DanhMucMaster) => a.ten.localeCompare(b.ten),
        },
        {
            title: 'Mã',
            dataIndex: 'ma',
            key: 'ma',
            width: 120,
            render: (ma: string) => ma || '-',
        },
        {
            title: 'Thứ tự',
            dataIndex: 'thu_tu',
            key: 'thu_tu',
            width: 100,
            sorter: (a: DanhMucMaster, b: DanhMucMaster) => a.thu_tu - b.thu_tu,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'kich_hoat',
            key: 'kich_hoat',
            width: 120,
            render: (kich_hoat: boolean) => (
                kich_hoat ?
                    <Tag color="success">Kích hoạt</Tag> :
                    <Tag color="default">Vô hiệu</Tag>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'ghi_chu',
            key: 'ghi_chu',
            ellipsis: true,
            render: (ghi_chu: string) => ghi_chu || '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_: any, record: DanhMucMaster) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa danh mục này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const tabItems = Object.entries(TenLoaiDanhMuc).map(([key, label]) => ({
        key,
        label,
        children: (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Space>
                        <Tooltip title="Import từ CSV">
                            <Button
                                icon={<FileTextOutlined />}
                                onClick={() => setIsImportModalVisible(true)}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm mới
                        </Button>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={data?.data}
                    rowKey="id"
                    loading={isLoading}
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                />
            </Space>
        ),
    }));

    return (
        <Card title="Quản lý danh mục Master Data">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
            />

            <MasterDataModal
                visible={isModalVisible}
                item={editingItem}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingItem(null);
                }}
                onSuccess={() => {
                    setIsModalVisible(false);
                    setEditingItem(null);
                }}
                loading={createMutation.isPending || updateMutation.isPending}
                onSave={handleSave}
                defaultCategory={activeTab}
            />

            <ImportModal
                visible={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['danh-muc-master'] });
                    setIsImportModalVisible(false);
                }}
                title={`Import ${TenLoaiDanhMuc[activeTab as LoaiDanhMuc]}`}
                endpoint="/nhap-lieu/danh-muc-master-csv"
                description={`Cột cần có: 'ten' (bắt buộc), 'ma', 'ghi_chu', 'thu_tu'. Hệ thống sẽ tự động gán loại danh mục: ${TenLoaiDanhMuc[activeTab as LoaiDanhMuc]}`}
                additionalFields={{ loai_danh_muc: activeTab }}
            />
        </Card>
    );
};

export default MasterData;
