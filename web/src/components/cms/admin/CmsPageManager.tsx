import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { DeleteOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import {
  createAdminPage,
  deleteAdminPage,
  getAdminPage,
  getAdminPages,
  publishAdminPage,
  saveAdminPageDraft,
  unpublishAdminPage,
  updateAdminPage,
} from '../../../api/cms';
import type { CMSContentType, CMSPageInput } from '../../../types/cms';
import { extractMetadataFormValues, parseMetadataFormValues } from './cms-admin.util';

const { Text, Title } = Typography;

interface CMSPageFormValues {
  tieu_de: string;
  slug?: string;
  mo_ta?: string;
  loai_noi_dung: CMSContentType;
  noi_dung_html?: string;
  la_trang_chu: boolean;
  loai_van_ban?: string;
  so_hieu?: string;
  don_vi_ban_hanh?: string;
  ngay_ban_hanh?: string;
  media_items?: Array<{
    loai: 'IMAGE' | 'VIDEO';
    duong_dan: string;
    ghi_chu?: string;
  }>;
}

const CmsPageManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CMSPageFormValues>();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['cms', 'admin', 'pages'],
    queryFn: getAdminPages,
  });

  const { data: selectedPage, isLoading: isLoadingPage } = useQuery({
    queryKey: ['cms', 'admin', 'page', selectedPageId],
    queryFn: () => getAdminPage(selectedPageId!),
    enabled: selectedPageId !== null,
  });

  const selectedContentType = Form.useWatch('loai_noi_dung', form) || 'HTML';

  useEffect(() => {
    if (!selectedPage) {
      return;
    }

    form.setFieldsValue({
      tieu_de: selectedPage.tieu_de,
      slug: selectedPage.slug,
      mo_ta: selectedPage.mo_ta,
      loai_noi_dung: selectedPage.loai_noi_dung,
      noi_dung_html: selectedPage.noi_dung_html,
      la_trang_chu: selectedPage.la_trang_chu,
      ...extractMetadataFormValues(selectedPage.metadata),
    });
    setSelectedFile(null);
  }, [form, selectedPage]);

  const refreshCms = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'pages'] }),
      queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'menus'] }),
      queryClient.invalidateQueries({ queryKey: ['cms', 'home'] }),
      queryClient.invalidateQueries({ queryKey: ['cms', 'menus'] }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createAdminPage,
    onSuccess: async (page) => {
      await refreshCms();
      setSelectedPageId(page.id);
      messageApi.success('Da tao trang CMS.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong tao duoc trang CMS.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CMSPageInput }) => updateAdminPage(id, input),
    onSuccess: async () => {
      await refreshCms();
      if (selectedPageId) {
        await queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'page', selectedPageId] });
      }
      messageApi.success('Da cap nhat noi dung trang.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong cap nhat duoc trang.');
    },
  });

  const draftMutation = useMutation({
    mutationFn: saveAdminPageDraft,
    onSuccess: async () => {
      await refreshCms();
      if (selectedPageId) {
        await queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'page', selectedPageId] });
      }
      messageApi.success('Da luu trang o trang thai nhap.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong luu duoc trang nhap.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishAdminPage,
    onSuccess: async () => {
      await refreshCms();
      if (selectedPageId) {
        await queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'page', selectedPageId] });
      }
      messageApi.success('Da xuat ban trang CMS.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong xuat ban duoc trang.');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: unpublishAdminPage,
    onSuccess: async () => {
      await refreshCms();
      if (selectedPageId) {
        await queryClient.invalidateQueries({ queryKey: ['cms', 'admin', 'page', selectedPageId] });
      }
      messageApi.success('Da go trang khoi khu vuc cong khai va chuyen ve nhap.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong go duoc trang khoi khu vuc cong khai.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminPage,
    onSuccess: async (_result, id) => {
      await refreshCms();
      if (selectedPageId === id) {
        setSelectedPageId(null);
        setSelectedFile(null);
        form.resetFields();
      }
      messageApi.success('Da xoa trang CMS.');
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || 'Khong xoa duoc trang CMS.');
    },
  });

  const publishedCount = useMemo(() => pages.filter((page) => page.trang_thai === 'PUBLISHED').length, [pages]);

  const resetForCreate = () => {
    setSelectedPageId(null);
    setSelectedFile(null);
    form.resetFields();
    form.setFieldsValue({
      loai_noi_dung: 'HTML',
      la_trang_chu: false,
    });
  };

  useEffect(() => {
    if (!selectedPageId && pages.length > 0 && !form.getFieldValue('loai_noi_dung')) {
      form.setFieldsValue({ loai_noi_dung: 'HTML', la_trang_chu: false });
    }
  }, [form, pages.length, selectedPageId]);

  const buildPayload = (values: CMSPageFormValues): CMSPageInput => ({
    tieu_de: values.tieu_de,
    slug: values.slug,
    mo_ta: values.mo_ta,
    loai_noi_dung: values.loai_noi_dung,
    noi_dung_html: values.noi_dung_html,
    la_trang_chu: values.la_trang_chu,
    metadata: parseMetadataFormValues({
      loai_van_ban: values.loai_van_ban,
      so_hieu: values.so_hieu,
      don_vi_ban_hanh: values.don_vi_ban_hanh,
      ngay_ban_hanh: values.ngay_ban_hanh,
      media_items: (values.media_items || [])
        .filter((item) => item.duong_dan?.trim())
        .map((item) => ({
          loai: item.loai as 'IMAGE' | 'VIDEO',
          duong_dan: item.duong_dan.trim(),
          ghi_chu: item.ghi_chu?.trim() || '',
        })),
    }),
    tep_noi_dung: selectedFile,
  });

  const persistPage = async (values: CMSPageFormValues) => {
    const payload = buildPayload(values);
    if (selectedPageId) {
      await updateMutation.mutateAsync({ id: selectedPageId, input: payload });
      return selectedPageId;
    }

    const created = await createMutation.mutateAsync(payload);
    return created.id;
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await persistPage(values);
  };

  const handleSaveDraft = async () => {
    const values = await form.validateFields();
    const id = await persistPage(values);
    await draftMutation.mutateAsync(id);
  };

  const handlePublish = async () => {
    const values = await form.validateFields();
    const id = await persistPage(values);
    await publishMutation.mutateAsync(id);
  };

  const handleUnpublish = async () => {
    if (!selectedPageId) {
      return;
    }

    await unpublishMutation.mutateAsync(selectedPageId);
  };

  const handleDelete = () => {
    if (!selectedPageId || !selectedPage) {
      return;
    }

    Modal.confirm({
      title: 'Xoa trang CMS?',
      content: `Trang "${selectedPage.tieu_de}" se bi xoa khoi he thong.`,
      okText: 'Xoa',
      okButtonProps: { danger: true },
      cancelText: 'Huy',
      onOk: async () => {
        await deleteMutation.mutateAsync(selectedPageId);
      },
    });
  };

  const uploadAccept = selectedContentType === 'PDF' ? '.pdf,application/pdf' : '.html,text/html';

  return (
    <>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title="Trang noi dung"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={resetForCreate}>
                Tao trang
              </Button>
            }
          >
            <Space orientation="vertical" size={4} style={{ marginBottom: 16 }}>
              <Text strong>{pages.length} trang</Text>
              <Text type="secondary">{publishedCount} trang dang public</Text>
            </Space>
            <List
              bordered
              loading={isLoading}
              dataSource={pages}
              renderItem={(page) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    background: selectedPageId === page.id ? '#f0f5ff' : undefined,
                    borderInlineStart: selectedPageId === page.id ? '3px solid #1677ff' : '3px solid transparent',
                  }}
                  onClick={() => setSelectedPageId(page.id)}
                >
                  <List.Item.Meta
                    avatar={page.loai_noi_dung === 'PDF' ? <FilePdfOutlined /> : page.loai_noi_dung === 'MEDIA' ? <FileImageOutlined /> : <FileTextOutlined />}
                    title={
                      <Space wrap>
                        <span>{page.tieu_de}</span>
                        {page.la_trang_chu && <Tag color="gold">Trang chu</Tag>}
                        <Tag color={page.trang_thai === 'PUBLISHED' ? 'green' : 'default'}>{page.trang_thai}</Tag>
                      </Space>
                    }
                    description={page.slug}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title={selectedPageId ? 'Cap nhat trang' : 'Tao trang moi'}
            extra={
              <Space wrap>
                <Button icon={<SaveOutlined />} onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
                  Luu noi dung
                </Button>
                <Button onClick={handleSaveDraft} loading={draftMutation.isPending}>
                  Luu nhap
                </Button>
                <Button onClick={handleUnpublish} disabled={!selectedPageId} loading={unpublishMutation.isPending}>
                  Go public
                </Button>
                <Button type="primary" onClick={handlePublish} loading={publishMutation.isPending}>
                  Xuat ban
                </Button>
                <Button danger onClick={handleDelete} disabled={!selectedPageId} loading={deleteMutation.isPending}>
                  Xoa
                </Button>
              </Space>
            }
          >
            {selectedPageId && isLoadingPage ? (
              <Alert type="info" message="Dang tai chi tiet trang..." />
            ) : (
              <Form form={form} layout="vertical" initialValues={{ loai_noi_dung: 'HTML', la_trang_chu: false }}>
                <Row gutter={16}>
                  <Col xs={24} md={16}>
                    <Form.Item name="tieu_de" label="Tieu de" rules={[{ required: true, message: 'Nhap tieu de trang.' }]}>
                      <Input placeholder="Vi du: Gioi thieu truong" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="slug" label="Slug URL">
                      <Input placeholder="gioi-thieu-truong" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="mo_ta" label="Mo ta ngan">
                  <Input.TextArea rows={2} placeholder="Tom tat ngan cho trang noi dung" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="loai_noi_dung" label="Loai noi dung" rules={[{ required: true }]}> 
                      <Select
                        options={[
                          { value: 'HTML', label: 'HTML' },
                          { value: 'PDF', label: 'PDF' },
                          { value: 'MEDIA', label: 'Media' },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="la_trang_chu" label="Dat lam trang chu" valuePropName="checked">
                      <Switch checkedChildren="Trang chu" unCheckedChildren="Trang thuong" />
                    </Form.Item>
                  </Col>
                </Row>

                {selectedContentType === 'HTML' ? (
                  <>
                    <Form.Item name="noi_dung_html" label="Noi dung HTML nhap tay">
                      <Input.TextArea
                        rows={12}
                        placeholder="Dan HTML sach hoac nhap cau truc HTML tai day"
                      />
                    </Form.Item>
                    <Form.Item label="Hoac tai file HTML (toi da 2MB)">
                      <Upload
                        beforeUpload={(file) => {
                          setSelectedFile(file);
                          return false;
                        }}
                        accept={uploadAccept}
                        fileList={selectedFile ? [{ uid: selectedFile.name, name: selectedFile.name, status: 'done' }] : []}
                        onRemove={() => {
                          setSelectedFile(null);
                          return true;
                        }}
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>Chon file HTML</Button>
                      </Upload>
                    </Form.Item>
                  </>
                ) : selectedContentType === 'PDF' ? (
                  <Form.Item
                    label="Tep PDF (toi da 2MB)"
                    extra={selectedPage?.ten_tep_goc ? `Tep hien tai: ${selectedPage.ten_tep_goc}` : 'PDF se duoc hien thi bang embedded viewer o trang public.'}
                  >
                    <Upload
                      beforeUpload={(file) => {
                        setSelectedFile(file);
                        return false;
                      }}
                      accept={uploadAccept}
                      fileList={selectedFile ? [{ uid: selectedFile.name, name: selectedFile.name, status: 'done' }] : []}
                      onRemove={() => {
                        setSelectedFile(null);
                        return true;
                      }}
                      maxCount={1}
                    >
                      <Button icon={<UploadOutlined />}>Chon file PDF</Button>
                    </Upload>
                  </Form.Item>
                ) : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                      message="Trang media ho tro nhieu anh va video bang URL, moi muc co ghi chu rieng."
                      description={(
                        <div>
                          <div>Cách dùng:</div>
                          <div>1. Chon `Anh` hoac `Video`.</div>
                          <div>2. Dan URL truy cap truc tiep vao o `URL media`.</div>
                          <div>3. Nhap `Ghi chu` neu muon hien mo ta ben duoi media.</div>
                          <div>4. Bam `Them media` de chen tiep nhieu muc.</div>
                          <div>5. Xuat ban khi danh sach media da day du.</div>
                        </div>
                      )}
                    />
                    <Form.List name="media_items">
                      {(fields, { add, remove }) => (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                          {fields.map((field, index) => (
                            <Card
                              key={field.key}
                              size="small"
                              title={`Media ${index + 1}`}
                              extra={
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => remove(field.name)}
                                />
                              }
                            >
                              <Row gutter={16}>
                                <Col xs={24} md={8}>
                                  <Form.Item
                                    name={[field.name, 'loai']}
                                    label="Loai"
                                    rules={[{ required: true, message: 'Chon loai media.' }]}
                                  >
                                    <Select
                                      options={[
                                        { value: 'IMAGE', label: 'Anh' },
                                        { value: 'VIDEO', label: 'Video' },
                                      ]}
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={16}>
                                  <Form.Item
                                    name={[field.name, 'duong_dan']}
                                    label="URL media"
                                    rules={[{ required: true, message: 'Nhap duong dan media.' }]}
                                  >
                                    <Input placeholder="https://..." />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Form.Item name={[field.name, 'ghi_chu']} label="Ghi chu">
                                <Input.TextArea rows={2} placeholder="Mo ta ngan cho media nay" />
                              </Form.Item>
                            </Card>
                          ))}
                          <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ loai: 'IMAGE' })}>
                            Them media
                          </Button>
                        </Space>
                      )}
                    </Form.List>
                  </>
                )}

                <Divider />
                <Title level={5}>Metadata van ban</Title>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="loai_van_ban" label="Loai van ban">
                      <Input placeholder="Quy che, ke hoach, bao cao..." />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="so_hieu" label="So hieu">
                      <Input placeholder="12/QD-THDTNT" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="don_vi_ban_hanh" label="Don vi ban hanh">
                      <Input placeholder="So GDDT, Truong..." />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="ngay_ban_hanh" label="Ngay ban hanh">
                      <Input placeholder="2026-04-06" />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CmsPageManager;
