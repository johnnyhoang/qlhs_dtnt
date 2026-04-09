import React from 'react';
import { Button, Drawer, Grid, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import logoDtnt from '../../assets/logo-dtnt.png';

const { useBreakpoint } = Grid;

interface TopNavigationProps {
  items: MenuProps['items'];
  selectedKeys: string[];
  onClick: MenuProps['onClick'];
  rightContent?: React.ReactNode;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
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
        <div className="top-nav__brand" aria-hidden="true">
          <img
            src={logoDtnt}
            alt="Logo Truong Pho thong Dan toc Noi tru THCS-THPT tinh Lam Dong"
            className="top-nav__brand-logo"
          />
        </div>
        {screens.lg ? (
          <>
            <Menu
              mode="horizontal"
              items={items}
              selectedKeys={selectedKeys}
              onClick={onClick}
              className="top-nav__menu"
              overflowedIndicator={<span className="top-nav__overflow">Them</span>}
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
              alt="Logo Truong Pho thong Dan toc Noi tru THCS-THPT tinh Lam Dong"
              className="top-nav__brand-logo"
            />
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
