import React from 'react';
import { Card, Table, Button, Tag, Typography, Tooltip, Popconfirm, message, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusOutlined, EditOutlined, FileSearchOutlined, DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getCdsEvaluations, deleteCdsEvaluation } from '../../api/cds-evaluation';
import SkeletonLoader from '../../components/SkeletonLoader';

const { Title } = Typography;

const CdsEvaluations: React.FC = () => {
    const navigate = useNavigate();

    const { data: evaluations, isLoading } = useQuery({
        queryKey: ['cds-evaluations'],
        queryFn: () => getCdsEvaluations()
    });

    const userJson = localStorage.getItem('user');
    const currentUser = userJson ? JSON.parse(userJson) : null;
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteCdsEvaluation(id),
        onSuccess: () => {
            message.success('Đã xoá phiếu thành công!');
            queryClient.invalidateQueries({ queryKey: ['cds-evaluations'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Lỗi khi xoá phiếu');
        }
    });

    const columns = [
        {
            title: 'Kỳ đánh giá',
            dataIndex: ['period', 'year'],
            key: 'year',
            width: 150,
            render: (text: string) => <b>{text || 'Năm học hiện hành'}</b>
        },
        {
            title: 'Người điền phiếu',
            dataIndex: 'submitter_name',
            key: 'submitter_name',
            width: 160,
            render: (text: string, record: any) => <span>{text || record.user?.ho_ten || 'Không rõ'}</span>
        },
        {
            title: 'Tổng điểm hệ Dạy học',
            dataIndex: 'total_score_group1',
            key: 't1',
            width: 180,
            render: (score: number) => <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>{score} / 100</Tag>
        },
        {
            title: 'Tổng điểm hệ Quản trị',
            dataIndex: 'total_score_group2',
            key: 't2',
            width: 180,
            render: (score: number) => <Tag color="cyan" style={{ fontSize: '14px', padding: '4px 8px' }}>{score} / 100</Tag>
        },
        {
            title: 'Mức độ',
            dataIndex: 'level',
            key: 'level',
            width: 150,
            render: (level: number) => {
                const color = level === 3 ? 'success' : level === 2 ? 'warning' : 'error';
                const text = level === 3 ? 'Mức 3 (Tốt)' : level === 2 ? 'Mức 2 (Cơ bản)' : 'Mức 1 (Chưa đạt)';
                return <Tag color={color} style={{ fontWeight: 'bold' }}>{text}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                return <Tag color={status === 'SUBMITTED' ? 'green' : 'default'}>{status === 'SUBMITTED' ? 'Đã nộp' : 'Bản nháp'}</Tag>;
            }
        },
        {
            title: 'Ngày nộp / Cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            fixed: 'right' as const,
            width: 160,
            render: (_: any, record: any) => {
                const canDelete = currentUser?.vai_tro === 'ADMIN' || currentUser?.id === record.user?.id;
                return (
                    <Space size="small">
                        <Tooltip title={record.status === 'DRAFT' ? 'Tiếp tục điền' : 'Xem báo cáo'}>
                            <Button 
                                type="primary" 
                                shape="circle"
                                icon={record.status === 'DRAFT' ? <EditOutlined /> : <FileSearchOutlined />} 
                                onClick={() => navigate(`/cds/evaluations/${record.id}`)}
                            />
                        </Tooltip>
                        
                        <Tooltip title="In PDF">
                            <Button 
                                type="default"
                                shape="circle"
                                icon={<PrinterOutlined />}
                                onClick={() => window.open(`/cds/evaluations/print/${record.id}`, '_blank')}
                            />
                        </Tooltip>

                        {canDelete && (
                            <Popconfirm title="Bạn có chắc là muốn xoá phiếu này không?" onConfirm={() => deleteMutation.mutate(record.id)}>
                                <Tooltip title="Xoá phiếu">
                                    <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
                                </Tooltip>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        }
    ];

    return (
        <Card 
            size="small" 
            title={<Title level={4} style={{ margin: 0, padding: '8px 0' }}>Danh sách Phiếu đánh giá Chuyển đổi số</Title>}
            extra={
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/cds/evaluations/new')} style={{ borderRadius: '8px' }}>
                    Tạo đánh giá mới
                </Button>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
            {isLoading ? <SkeletonLoader type="table" /> : (
                <Table 
                    dataSource={evaluations} 
                    columns={columns} 
                    rowKey="id" 
                    scroll={{ x: 1000 }} 
                    pagination={{ pageSize: 15 }}
                />
            )}
        </Card>
    );
}

export default CdsEvaluations;
