import React, { useState } from 'react';
import { Modal, Upload, Button, message, List, Typography, Statistic, Space, Divider } from 'antd';
import { InboxOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import client from '../api/client';

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    title?: string;
    endpoint?: string;
    description?: string;
    additionalFields?: Record<string, any>;
}

const ImportModal: React.FC<ImportModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    title = "Import học sinh từ CSV",
    endpoint = "/nhap-lieu/hoc-sinh-csv",
    description = "Hệ thống sẽ cập nhật thông tin học sinh. File CSV cần có các cột tối thiểu: ma_hoc_sinh, ho_ten, lop.",
    additionalFields
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleImport = async () => {
        if (fileList.length === 0) {
            message.warning('Vui lòng chọn file CSV');
            return;
        }

        const file = fileList[0];
        console.log('[FRONTEND] ImportModal: Starting import for file:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        const formData = new FormData();
        formData.append('file', file as any);
        if (additionalFields) {
            Object.entries(additionalFields).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        setImporting(true);
        try {
            console.log(`[FRONTEND] ImportModal: Sending POST request to ${endpoint}`);
            const response = await client.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('[FRONTEND] ImportModal: Received response:', response.data);
            setResults(response.data.data);
            message.success('Import hoàn tất');
        } catch (error: any) {
            console.error('[FRONTEND] ImportModal: Error during import:', error);
            message.error(error.response?.data?.message || 'Lỗi khi import file');
        } finally {
            setImporting(false);
        }
    };

    const draggerProps = {
        name: 'file',
        multiple: false,
        fileList,
        beforeUpload: (file: any) => {
            const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv');
            if (!isCsv) {
                message.error('Chỉ chấp nhận file CSV (.csv)');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
    };

    const handleClose = () => {
        setResults(null);
        setFileList([]);
        if (results?.thanh_cong > 0) {
            onSuccess();
        }
        onCancel();
    };

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button key="close" onClick={handleClose}>Đóng</Button>,
                <Button
                    key="import"
                    type="primary"
                    onClick={handleImport}
                    loading={importing}
                    disabled={fileList.length === 0 || results}
                >
                    Bắt đầu Import
                </Button>
            ]}
            width={800}
        >
            {!results ? (
                <>
                    <div style={{ marginBottom: 24 }}>
                        <Text strong><InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Hướng dẫn Import</Text>
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0f2f5', borderRadius: '4px' }}>
                            <Text>{description}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                            * Lưu ý: Hệ thống hỗ trợ định dạng CSV UTF-8. Các cột có thể viết Tiếng Việt không dấu.
                        </Text>
                    </div>
                    <Divider />
                    <Dragger {...draggerProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Nhấp hoặc kéo tệp vào khu vực này để tải lên</p>
                        <p className="ant-upload-hint">Chỉ chấp nhận file .csv</p>
                    </Dragger>
                </>
            ) : (
                <div>
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                        <Space size="large">
                            <Statistic title="Thành công" value={results.thanh_cong} valueStyle={{ color: '#3f8600' }} />
                            <Statistic title="Thất bại" value={results.loi} valueStyle={{ color: '#cf1322' }} />
                        </Space>
                    </div>
                    {results.chi_tiet_loi?.length > 0 && (
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            <Text type="danger" strong>Danh sách lỗi:</Text>
                            <List
                                size="small"
                                dataSource={results.chi_tiet_loi}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {item.item_ten !== 'N/A' ? item.item_ten : item.item_ma}: {item.error}
                                        </Text>
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default ImportModal;
