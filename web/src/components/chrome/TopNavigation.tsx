import React from 'react';
import { Button, Drawer, Grid, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import logoDtnt from '../../assets/logo-dtnt.png';

const { useBreakpoint } = Grid;

interface TopNavigationProps {
    title: string;
    items: MenuProps['items'];
    selectedKeys: string[];
    onClick: MenuProps['onClick'];
    rightContent?: React.ReactNode;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
    title,
    items,
    selectedKeys,
    onClick,
    rightContent,
}) => {
    const screens = useBreakpoint();
    const [open, setOpen] = React.useState(false);

    const handleClick: MenuProps['onClick'] = (info) => {
        setOpen(false);
        if (onClick) {
            onClick(info);
        }
    };

    return (
        <div className="top-nav">
            <div className="top-nav__inner">
                <div className="top-nav__brand">
                    <img
                        src={logoDtnt}
                        alt={"Logo Tr\u01b0\u1eddng Ph\u1ed5 th\u00f4ng D\u00e2n t\u1ed9c N\u1ed9i tr\u00fa THCS-THPT t\u1ec9nh L\u00e2m \u0110\u1ed3ng"}
                        className="top-nav__brand-logo"
                    />
                    <span className="top-nav__brand-copy">{title}</span>
                </div>
                {screens.lg ? (
                    <>
                        <Menu
                            mode="horizontal"
                            items={items}
                            selectedKeys={selectedKeys}
                            onClick={onClick}
                            className="top-nav__menu"
                            overflowedIndicator={<span className="top-nav__overflow">More</span>}
                        />
                        {rightContent ? <div className="top-nav__actions">{rightContent}</div> : null}
                    </>
                ) : (
                    <Space size="small">
                        {rightContent ? <div className="top-nav__actions top-nav__actions--mobile">{rightContent}</div> : null}
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            className="top-nav__menu-button"
                            onClick={() => setOpen(true)}
                        />
                    </Space>
                )}
            </div>
            <Drawer
                title={(
                    <div className="top-nav__brand top-nav__brand--drawer">
                        <img
                            src={logoDtnt}
                            alt={"Logo Tr\u01b0\u1eddng Ph\u1ed5 th\u00f4ng D\u00e2n t\u1ed9c N\u1ed9i tr\u00fa THCS-THPT t\u1ec9nh L\u00e2m \u0110\u1ed3ng"}
                            className="top-nav__brand-logo"
                        />
                        <span className="top-nav__brand-copy">{title}</span>
                    </div>
                )}
                placement="right"
                onClose={() => setOpen(false)}
                open={open}
                width={320}
                className="top-nav__drawer"
            >
                <Menu
                    mode="inline"
                    items={items}
                    selectedKeys={selectedKeys}
                    onClick={handleClick}
                />
                {rightContent ? <div className="top-nav__drawer-actions">{rightContent}</div> : null}
            </Drawer>
        </div>
    );
};

export default TopNavigation;
