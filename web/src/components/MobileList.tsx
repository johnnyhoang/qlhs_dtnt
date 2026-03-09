import React from 'react';
import { Card, List, Empty, Spin } from 'antd';

interface MobileListProps<T> {
    dataSource: T[] | undefined;
    renderItem: (item: T) => React.ReactNode;
    loading?: boolean;
    rowKey?: keyof T | ((record: T) => string | number);
    onRowClick?: (record: T) => void;
    emptyText?: string;
}

function MobileList<T>({
    dataSource,
    renderItem,
    loading,
    rowKey,
    onRowClick,
    emptyText = "Không có dữ liệu"
}: MobileListProps<T>) {
    if (loading && (!dataSource || dataSource.length === 0)) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!dataSource || dataSource.length === 0) {
        return <Empty description={emptyText} style={{ padding: '40px 0' }} />;
    }

    return (
        <div className="mobile-list-container">
            <List
                dataSource={dataSource}
                split={false}
                renderItem={(item) => {
                    const key = typeof rowKey === 'function'
                        ? rowKey(item)
                        : (item as any)[rowKey as string] || (item as any).id || (item as any).key;

                    return (
                        <List.Item
                            key={key}
                            onClick={() => onRowClick?.(item)}
                            style={{ padding: '8px 0', cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                            <Card
                                size="small"
                                hoverable={!!onRowClick}
                                style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                            >
                                {renderItem(item)}
                            </Card>
                        </List.Item>
                    );
                }}
            />
        </div>
    );
}

export default MobileList;
