import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tree,
  Typography,
} from 'antd';
import type { TreeProps } from 'antd';
import { EditOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { createAdminMenu, deleteAdminMenu, getAdminMenus, getAdminPages, reorderAdminMenus, updateAdminMenu } from '../../../api/cms';
import type { CMSAdminMenu, CMSMenuInput } from '../../../types/cms';
import {
  buildCmsAdminTree,
  collectCmsAdminDescendantIds,
  findCmsAdminTreeNode,
  flattenCmsAdminTree,
  reorderCmsAdminTree,
  toAntTreeData,
} from './cms-admin.util';

const { Text } = Typography;

interface CMSMenuFormValues {
  nhan_menu: string;
  duong_dan?: string;
  parent_id?: number | null;
  page_id?: number | null;
  hien_thi: boolean;
}

const CmsMenuManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CMSMenuFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const [editingMenu, setEditingMenu] = useState<CMSAdminMenu | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treeState, setTreeState] = useState(() => [] as ReturnType<typeof buildCmsAdminTree>);

  const { data: menus = [], isLoading } = useQuery({
    queryKey: ['cms', 'admin', 'menus'],
    queryFn: getAdminMenus,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['cms', 'admin', 'pages'],
    queryFn: getAdminPages,
  });

  useEffect(() => {
    setTreeState(buildCmsAdminTree(menus));
  }, [menus]);

  const refreshCms = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'menus'] }),
      queryClient.invalidateQueries({ queryKey: ['cms', 'menus'] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createAdminMenu,
    onSuccess: async () => {
      await refreshCms();
      messageApi.success('Da tao menu CMS.');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong tao duoc menu CMS.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CMSMenuInput }) => updateAdminMenu(id, input),
    onSuccess: async () => {
      await refreshCms();
      messageApi.success('Da cap nhat menu CMS.');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong cap nhat duoc menu CMS.');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderAdminMenus,
    onSuccess: async () => {
      await refreshCms();
      messageApi.success('Da cap nhat thu tu menu.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong cap nhat duoc thu tu menu.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminMenu,
    onSuccess: async () => {
      await refreshCms();
      messageApi.success('Da xoa menu CMS.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong xoa duoc menu CMS.');
    },
  });

  const pageOptions = useMemo(
    () => pages.map((page) => ({ value: page.id, label: `${page.tieu_de} (${page.slug})` })),
    [pages],
  );

  const parentOptions = useMemo(
    () => menus.map((menu) => ({ value: menu.id, label: menu.nhan_menu })),
    [menus],
  );

  const blockedParentIds = useMemo(() => {
    if (!editingMenu) {
      return [];
    }

    const treeNode = findCmsAdminTreeNode(treeState, editingMenu.id);
    if (!treeNode) {
      return [editingMenu.id];
    }

    return [editingMenu.id, ...collectCmsAdminDescendantIds(treeNode)];
  }, [editingMenu, treeState]);

  const openCreateModal = () => {
    setEditingMenu(null);
    form.resetFields();
    form.setFieldsValue({ hien_thi: true, parent_id: null, page_id: null });
    setIsModalOpen(true);
  };

  const openEditModal = (menu: CMSAdminMenu) => {
    setEditingMenu(menu);
    form.setFieldsValue({
      nhan_menu: menu.nhan_menu,
      duong_dan: menu.duong_dan,
      parent_id: menu.parent_id ?? null,
      page_id: menu.page_id ?? null,
      hien_thi: menu.hien_thi,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload: CMSMenuInput = {
      nhan_menu: values.nhan_menu,
      loai_dich: 'PAGE',
      duong_dan: values.duong_dan,
      parent_id: values.parent_id ?? null,
      page_id: values.page_id ?? null,
      hien_thi: values.hien_thi,
      thu_tu: editingMenu?.thu_tu ?? menus.length,
    };

    if (editingMenu) {
      await updateMutation.mutateAsync({ id: editingMenu.id, input: payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  const handleDrop: TreeProps['onDrop'] = async (info) => {
    const dragId = Number(info.dragNode.key);
    const dropId = Number(info.node.key);
    const draggedNode = findCmsAdminTreeNode(treeState, dragId);

    if (draggedNode && collectCmsAdminDescendantIds(draggedNode).includes(dropId)) {
      messageApi.warning('Khong the keo menu cha vao ben trong menu con cua chinh no.');
      return;
    }

    const relativePosition = info.dropPosition - Number(String(info.node.pos).split('-').pop() || 0);
    const nextTree = reorderCmsAdminTree(treeState, dragId, dropId, info.dropToGap, relativePosition);

    setTreeState(nextTree);
    await reorderMutation.mutateAsync(flattenCmsAdminTree(nextTree));
  };

  const handleDelete = (menu: CMSAdminMenu) => {
    Modal.confirm({
      title: 'Xoa menu CMS?',
      content: `Menu "${menu.nhan_menu}" se bi xoa khoi cau truc dieu huong.`,
      okText: 'Xoa',
      okButtonProps: { danger: true },
      cancelText: 'Huy',
      onOk: async () => {
        await deleteMutation.mutateAsync(menu.id);
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Cau truc menu public"
            extra={
              <Space>
                <Tag color="blue">Keo-tha de doi thu tu hoac doi cap</Tag>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                  Them menu
                </Button>
              </Space>
            }
          >
            {isLoading ? (
              <Alert type="info" message="Dang tai cau truc menu..." />
            ) : (
              <Tree
                blockNode
                draggable
                onDrop={handleDrop}
                treeData={toAntTreeData(treeState)}
                titleRender={(node) => {
                  const menu = menus.find((item) => item.id === Number(node.key));
                  if (!menu) {
                    return <span>{String(node.title)}</span>;
                  }

                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <Space wrap>
                        <MenuOutlined />
                        <span>{menu.nhan_menu}</span>
                        {menu.page && <Tag>{menu.page.slug}</Tag>}
                        {!menu.hien_thi && <Tag color="default">An</Tag>}
                      </Space>
                      <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(menu)}>
                        Sua
                      </Button>
                      <Button type="link" danger onClick={() => handleDelete(menu)}>
                        Xoa
                      </Button>
                    </div>
                  );
                }}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Nguyen tac dieu huong">
            <Space direction="vertical" size={12}>
              <Text>Hai menu top-level co dinh Quan ly hoc sinh va Chuyen doi so duoc ghim ngoai CMS.</Text>
              <Text>Khoi nay chi quan ly phan menu noi dung public do admin/editor tao them.</Text>
              <Text>Duong dan public se duoc ghep theo cay menu: menu cha + menu con.</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingMenu ? 'Cap nhat menu' : 'Tao menu moi'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ hien_thi: true, parent_id: null, page_id: null }}>
          <Form.Item name="nhan_menu" label="Nhan menu" rules={[{ required: true, message: 'Nhap ten menu.' }]}>
            <Input placeholder="Vi du: Van ban" />
          </Form.Item>
          <Form.Item name="duong_dan" label="Slug menu" rules={[{ required: true, message: 'Nhap duong dan menu.' }]}>
            <Input placeholder="van-ban" />
          </Form.Item>
          <Form.Item name="page_id" label="Trang noi dung gan voi menu" rules={[{ required: true, message: 'Chon mot trang noi dung.' }]}>
            <Select
              allowClear
              showSearch
              placeholder="Chon trang CMS"
              options={pageOptions}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="parent_id" label="Menu cha">
            <Select
              allowClear
              placeholder="Top-level"
              options={parentOptions.filter((option) => !blockedParentIds.includes(option.value))}
            />
          </Form.Item>
          <Form.Item name="hien_thi" label="Hien thi public" valuePropName="checked">
            <Switch checkedChildren="Hien" unCheckedChildren="An" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CmsMenuManager;
