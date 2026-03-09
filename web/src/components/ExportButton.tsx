import React from 'react';
import { Button, Tooltip, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import axiosClient from '../api/client';

interface ExportButtonProps {
    endpoint: string;
    filename: string;
    params?: any;
    tooltip?: string;
    buttonText?: string;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

const ExportButton: React.FC<ExportButtonProps> = ({
    endpoint,
    filename,
    params,
    tooltip = "Xuất CSV",
    buttonText,
    type = 'default'
}) => {
    const [loading, setLoading] = React.useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(endpoint, {
                params,
                responseType: 'blob', // Important for file downloads
            });

            // Create a link element and trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('Xuất file thành công');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Lỗi khi xuất file');
        } finally {
            setLoading(false);
        }
    };

    const button = (
        <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            loading={loading}
            type={type}
        >
            {buttonText}
        </Button>
    );

    if (tooltip) {
        return (
            <Tooltip title={tooltip}>
                {button}
            </Tooltip>
        );
    }

    return button;
};

export default ExportButton;
