import React, { useState } from 'react';
import { Modal, Upload, Button, message, List, Typography, Statistic, Space, Table, Divider } from 'antd';
import { InboxOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import client from '../api/client';

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ visible, onCancel, onSuccess }) => {
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

        setImporting(true);
        try {
            console.log('[FRONTEND] ImportModal: Sending POST request to /nhap-lieu/hoc-sinh-csv');
            const response = await client.post('/nhap-lieu/hoc-sinh-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('[FRONTEND] ImportModal: Received response:', response.data);
            setResults(response.data.data); // Backend returns { message, data: { thanh_cong, loi, chi_tiet_loi } }
            message.success('Import hoàn tất');
        } catch (error: any) {
            console.error('[FRONTEND] ImportModal: Error during import:', error);
            if (error.response) {
                console.error('[FRONTEND] ImportModal: Error response data:', error.response.data);
                console.error('[FRONTEND] ImportModal: Error response status:', error.response.status);
            }
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
            title="Import học sinh từ CSV"
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
                        <Text strong><InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Cấu trúc file CSV hợp lệ</Text>
                        <Table
                            size="small"
                            pagination={false}
                            style={{ marginTop: 8 }}
                            dataSource={[
                                { col: 'Mã học sinh', req: 'Có', note: 'Không trùng lặp' },
                                { col: 'Họ và tên', req: 'Có', note: 'Tiếng Việt hoặc English' },
                                { col: 'Lớp', req: 'Có', note: 'Ví dụ: 10A1' },
                                { col: 'Mã MOET', req: 'Không', note: 'Mã định danh BGD' },
                                { col: 'Giới tính', req: 'Không', note: 'Nam/Nữ' },
                            ]}
                            columns={[
                                { title: 'Tên cột (Header)', dataIndex: 'col', key: 'col' },
                                { title: 'Bắt buộc', dataIndex: 'req', key: 'req', align: 'center' },
                                { title: 'Ghi chú', dataIndex: 'note', key: 'note' },
                            ]}
                        />
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                            * Bạn có thể sử dụng tên cột bằng tiếng Việt không dấu (ma_hoc_sinh, ho_ten...)
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
