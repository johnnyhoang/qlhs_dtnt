import React from 'react';
import { Typography, Divider } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

interface AuditFooterProps {
    createdAt?: string | Date;
    updatedAt?: string | Date;
    updatedBy?: string;
}

const AuditFooter: React.FC<AuditFooterProps> = ({ createdAt, updatedAt, updatedBy }) => {
    if (!createdAt && !updatedAt) return null;

    return (
        <div style={{ marginTop: 24 }}>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6, fontSize: '0.85em' }}>
                <div>
                    {createdAt && (
                        <div>
                            <Text type="secondary">Ngày tạo: </Text>
                            <Text strong>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    {updatedAt && (
                        <div>
                            <Text type="secondary">Cập nhật lần cuối: </Text>
                            <Text strong>{dayjs(updatedAt).format('DD/MM/YYYY HH:mm')}</Text>
                        </div>
                    )}
                    {updatedBy && (
                        <div>
                            <Text type="secondary">Người thực hiện: </Text>
                            <Text strong>{updatedBy}</Text>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditFooter;
