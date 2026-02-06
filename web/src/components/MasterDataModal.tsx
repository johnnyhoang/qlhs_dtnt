import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Checkbox, InputNumber, message } from 'antd';
import { TenLoaiDanhMuc } from '../types/danh-muc-master';
import type { DanhMucMaster, CreateDanhMucRequest } from '../types/danh-muc-master';
import AuditFooter from './AuditFooter';

interface MasterDataModalProps {
    visible: boolean;
    item?: DanhMucMaster | null;
    onCancel: () => void;
    onSuccess: () => void;
    loading?: boolean;
    onSave: (data: CreateDanhMucRequest) => Promise<void>;
    defaultCategory?: string;
}

const MasterDataModal: React.FC<MasterDataModalProps> = ({
    visible,
    item,
    onCancel,
    onSuccess,
    loading,
    onSave,
    defaultCategory
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (item) {
                form.setFieldsValue(item);
            } else {
                form.resetFields();
                if (defaultCategory) {
                    form.setFieldValue('loai_danh_muc', defaultCategory);
                }
            }
        }
    }, [visible, item, form, defaultCategory]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSave(values);
            message.success(`${item ? 'Cập nhật' : 'Thêm'} danh mục thành công`);
            onSuccess();
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    return (
        <Modal
            title={item ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ kich_hoat: true, thu_tu: 0 }}
            >
                <Form.Item
                    name="loai_danh_muc"
                    label="Loại danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn loại danh mục' }]}
                >
                    <Select disabled={!!item}>
                        {Object.entries(TenLoaiDanhMuc).map(([key, label]) => (
                            <Select.Option key={key} value={key}>{label}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="ten"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input placeholder="Ví dụ: Bệnh viện Nhi Đồng 1" />
                    </Form.Item>
                    <Form.Item
                        name="ma"
                        label="Mã"
                    >
                        <Input placeholder="Mã viết tắt" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="ghi_chu"
                    label="Ghi chú"
                >
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm" />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="thu_tu"
                        label="Thứ tự hiển thị"
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item
                        name="kich_hoat"
                        valuePropName="checked"
                        label=" "
                    >
                        <Checkbox>Kích hoạt</Checkbox>
                    </Form.Item>
                </div>

                <AuditFooter
                    createdAt={item?.createdAt}
                    updatedAt={item?.updatedAt}
                    updatedBy={item?.nguoi_cap_nhat?.ho_ten}
                />
            </Form>
        </Modal>
    );
};

export default MasterDataModal;
