import React from 'react';
import { Card } from 'antd';

interface SkeletonLoaderProps {
    type: 'list' | 'table';
    rows?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, rows = 5 }) => {
    if (type === 'list') {
        return (
            <div className="mobile-only" style={{ padding: '0 4px' }}>
                {Array.from({ length: rows }).map((_, i) => (
                    <Card key={i} size="small" style={{ marginBottom: 12, borderRadius: 8 }}>
                        <div className="mobile-card-row">
                            <div className="skeleton-ghost" style={{ width: '60%', height: 20 }} />
                            <div className="skeleton-ghost" style={{ width: '20%', height: 20 }} />
                        </div>
                        <div className="mobile-card-row" style={{ marginTop: 8 }}>
                            <div className="skeleton-ghost" style={{ width: '40%', height: 16 }} />
                            <div className="skeleton-ghost" style={{ width: '30%', height: 16 }} />
                        </div>
                        <div style={{ marginTop: 12 }}>
                            <div className="skeleton-ghost" style={{ width: '80%', height: 14 }} />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="desktop-only">
            <div style={{ padding: 16 }}>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <div className="skeleton-ghost" style={{ flex: 1, height: 32 }} />
                        <div className="skeleton-ghost" style={{ flex: 2, height: 32 }} />
                        <div className="skeleton-ghost" style={{ flex: 1, height: 32 }} />
                        <div className="skeleton-ghost" style={{ flex: 1, height: 32 }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonLoader;
