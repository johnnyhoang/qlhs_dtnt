import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Tabs, message, Space, Typography, Tag, Row, Col, Divider, Select } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCdsCriteria, getCdsEvaluationById, createCdsEvaluation, updateCdsEvaluation, getCdsPeriods } from '../../api/cds-evaluation';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import SkeletonLoader from '../../components/SkeletonLoader';

const { Title, Text } = Typography;

const CdsEvaluationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id && id !== 'new';
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: criteria, isLoading: isLoadingCriteria } = useQuery({
        queryKey: ['cds-criteria'],
        queryFn: () => getCdsCriteria()
    });

    const { data: periods, isLoading: isLoadingPeriods } = useQuery({
        queryKey: ['cds-periods'],
        queryFn: () => getCdsPeriods()
    });

    const { data: evaluation, isLoading: isLoadingEval } = useQuery({
        queryKey: ['cds-eval', id],
        queryFn: () => getCdsEvaluationById(Number(id)),
        enabled: isEdit
    });

    useEffect(() => {
        if (isEdit && evaluation && criteria) {
            const initialValues: any = {};
            initialValues.submitter_name = evaluation.submitter_name || evaluation.user?.ho_ten;
            initialValues.periodId = evaluation.period?.id;
            evaluation.details.forEach((d: any) => {
                initialValues[`score_${d.criterion.id}`] = d.score;
                initialValues[`link_${d.criterion.id}`] = d.evidence_link;
                initialValues[`note_${d.criterion.id}`] = d.note;
            });
            form.setFieldsValue(initialValues);
        } else if (!isEdit && periods && periods.length > 0) {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                form.setFieldsValue({ 
                    submitter_name: user.ho_ten,
                    periodId: periods[0].id
                });
            }
        }
    }, [isEdit, evaluation, criteria, periods, form]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (isEdit) return updateCdsEvaluation(Number(id), data);
            return createCdsEvaluation(data);
        },
        onSuccess: () => {
            message.success('Đã lưu Phiếu đánh giá thành công');
            queryClient.invalidateQueries({ queryKey: ['cds-evaluations'] });
            navigate('/cds/evaluations');
        },
        onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu form');
        }
    });

    const handleFinish = (values: any, status: 'DRAFT' | 'SUBMITTED') => {
        if (!periods || periods.length === 0) {
            message.error('Hệ thống chưa tạo Kỳ đánh giá nào. Vui lòng liên hệ Admin.');
            return;
        }

        const details = [];
        for (const c of (criteria || [])) {
            const score = values[`score_${c.id}`];
            const link = values[`link_${c.id}`];
            const note = values[`note_${c.id}`];

            if (c.is_mandatory && !link && status === 'SUBMITTED') {
                message.error(`Thiếu minh chứng bắt buộc: ${c.name}`);
                return;
            }

            details.push({
                criterionId: c.id,
                score: score || 0,
                evidence_link: link,
                note: note
            });
        }

        const payload = {
            periodId: values.periodId,
            status,
            details
        };

        mutation.mutate(payload);
    };

    if (isLoadingCriteria || isLoadingPeriods || (isEdit && isLoadingEval)) {
        return <SkeletonLoader type="list" />;
    }

    const group1 = criteria?.filter((c: any) => c.group_code === 'DAY_HOC') || [];
    const group2 = criteria?.filter((c: any) => c.group_code === 'QUAN_TRI') || [];

    const isReadOnly = evaluation?.status === 'SUBMITTED';

    const renderCriteriaList = (list: any[]) => {
        return list.map(c => (
            <div key={c.id} style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Text strong style={{ fontSize: 16, color: '#1f1f1f' }}>{c.name}</Text>
                        {c.is_mandatory ? (
                            <Tag color="red" style={{ marginLeft: 12 }}>Bắt buộc</Tag>
                        ) : (
                            <Tag color="blue" style={{ marginLeft: 12 }}>Tối đa: {c.max_score} điểm</Tag>
                        )}
                    </Col>
                    
                    {!c.is_mandatory && (
                        <Col xs={24} md={6}>
                            <Form.Item 
                                name={`score_${c.id}`} 
                                label="Điểm tự đánh giá"
                                rules={[
                                    { 
                                        validator: async (_, value) => {
                                            if (value && Number(value) > c.max_score) {
                                                throw new Error(`Tối đa ${c.max_score} điểm`);
                                            }
                                        } 
                                    }
                                ]}
                            >
                                <Input type="number" min={0} max={c.max_score} step={0.5} placeholder={`Tối đa ${c.max_score} điểm`} disabled={isReadOnly} />
                            </Form.Item>
                        </Col>
                    )}

                    <Col xs={24} md={c.is_mandatory ? 24 : 18}>
                        <Form.Item 
                            name={`link_${c.id}`} 
                            label="Link minh chứng (GDrive, OneDrive, Hệ thống...)"
                            rules={[{ required: c.is_mandatory && !isReadOnly, message: 'Vui lòng cung cấp link minh chứng' }]}
                        >
                            <Input placeholder="Nhập đường dẫn URL đến tài liệu biên bản/trang web" disabled={isReadOnly}/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        ));
    };

    return (
        <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Space size="middle">
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cds/evaluations')} style={{ borderRadius: 8 }}>Quay lại</Button>
                        <Title level={4} style={{ margin: 0 }}>
                            {isEdit ? 'Chi tiết Phiếu Tự Đánh Giá' : 'Điền Phiếu Đánh Giá Mới'}
                        </Title>
                        {isEdit && (
                            <Tag color={evaluation?.status === 'SUBMITTED' ? 'green' : 'default'} style={{ fontSize: 14, padding: '4px 12px' }}>
                                {evaluation?.status === 'SUBMITTED' ? 'ĐÃ HIỆU LỰC (SUMBITTED)' : 'ĐANG SOẠN (DRAFT)'}
                            </Tag>
                        )}
                    </Space>
                    
                    {!isReadOnly && (
                        <Space>
                            <Button 
                                type="default" 
                                size="large"
                                icon={<SaveOutlined />} 
                                onClick={() => form.validateFields().then(v => handleFinish(v, 'DRAFT'))}
                                loading={mutation.isPending}
                                style={{ borderRadius: 8 }}
                            >
                                Lưu Bản Nháp
                            </Button>
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<SendOutlined />} 
                                onClick={() => form.validateFields().then(v => handleFinish(v, 'SUBMITTED'))}
                                loading={mutation.isPending}
                                style={{ borderRadius: 8 }}
                            >
                                Chính thức Nộp
                            </Button>
                        </Space>
                    )}
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={24} md={12}>
                            <Form.Item 
                                name="submitter_name" 
                                label={<span style={{ fontWeight: 500 }}>Tên người làm phiếu / Chịu trách nhiệm</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập tên người nộp phiếu' }]}
                            >
                                <Input size="large" placeholder="Nhập họ và tên..." disabled={isReadOnly} />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                            <Form.Item 
                                name="periodId" 
                                label={<span style={{ fontWeight: 500 }}>Kỳ đánh giá (Năm học)</span>}
                                rules={[{ required: true, message: 'Vui lòng chọn kỳ đánh giá' }]}
                            >
                                <Select size="large" placeholder="Chọn năm học..." disabled={isReadOnly}>
                                    {periods?.map((p: any) => (
                                        <Select.Option key={p.id} value={p.id}>{p.year}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Tabs 
                        defaultActiveKey="1"
                        size="large"
                        items={[
                            {
                                key: '1',
                                label: <span style={{ fontSize: 16, fontWeight: 500 }}>Nhóm 1: Dạy & Học</span>,
                                children: renderCriteriaList(group1)
                            },
                            {
                                key: '2',
                                label: <span style={{ fontSize: 16, fontWeight: 500 }}>Nhóm 2: Quản trị Cơ sở</span>,
                                children: renderCriteriaList(group2)
                            }
                        ]}
                    />
                </Form>
            </Space>
        </Card>
    );
};

export default CdsEvaluationForm;
