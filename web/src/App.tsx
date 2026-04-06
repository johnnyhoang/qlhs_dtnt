import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider, Spin } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { WEB_ENV } from './config/env';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Meals = lazy(() => import('./pages/Meals'));
const Transport = lazy(() => import('./pages/Transport'));
const Insurance = lazy(() => import('./pages/Insurance'));
const Payments = lazy(() => import('./pages/Payments'));
const Users = lazy(() => import('./pages/Users'));
const MasterData = lazy(() => import('./pages/MasterData'));
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const CdsDashboard = lazy(() => import('./pages/cds/CdsDashboard'));
const CdsEvaluations = lazy(() => import('./pages/cds/CdsEvaluations'));
const CdsEvaluationForm = lazy(() => import('./pages/cds/CdsEvaluationForm'));
const CdsAdminPeriods = lazy(() => import('./pages/cds/CdsAdminPeriods'));
const CdsEvaluationPrint = lazy(() => import('./pages/cds/CdsEvaluationPrint'));
const CdsPeriodPrint = lazy(() => import('./pages/cds/CdsPeriodPrint'));
const CmsAdminPage = lazy(() => import('./pages/CmsAdminPage'));
const PublicHomePage = lazy(() => import('./pages/public/PublicHomePage'));
const PublicCmsPage = lazy(() => import('./pages/public/PublicCmsPage'));

const queryClient = new QueryClient();

const RouteFallback: React.FC = () => (
  <div className="page-loading">
    <Spin size="large" />
  </div>
);

const buildLoginPath = () => {
  const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
  return `/admin/login?from=${redirectTo}`;
};

const ProtectedRoute = ({ children, module }: { children: React.ReactElement; module?: string }) => {
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    return <Navigate to={buildLoginPath()} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (!user || typeof user !== 'object') {
      throw new Error('Du lieu nguoi dung khong hop le');
    }

    if (user.vai_tro === 'ADMIN') {
      return children;
    }

    if (module) {
      const hasAccess = user.danh_sach_quyen?.some(
        (permission: any) => permission.ma_module === module && permission.co_quyen_xem,
      );
      if (!hasAccess) {
        return <Navigate to="/admin" replace />;
      }
    }
  } catch (error) {
    console.error('Loi xac thuc:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to={buildLoginPath()} replace />;
  }

  return children;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    return <Navigate to={buildLoginPath()} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (user?.vai_tro !== 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  } catch (error) {
    console.error('Loi quan tri:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to={buildLoginPath()} replace />;
  }

  return children;
};

const CmsRoute = ({ children }: { children: React.ReactElement }) => {
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    return <Navigate to={buildLoginPath()} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (!['ADMIN', 'EDITOR'].includes(user?.vai_tro)) {
      return <Navigate to="/admin" replace />;
    }
  } catch (error) {
    console.error('Loi CMS role:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to={buildLoginPath()} replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={WEB_ENV.GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#198f38',
                colorInfo: '#198f38',
                colorSuccess: '#2a9d4b',
                colorWarning: '#d7a830',
                colorError: '#c54833',
                colorTextBase: '#183625',
                colorBgBase: '#f4f8f1',
                fontSize: 14,
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                borderRadius: 18,
                borderRadiusLG: 24,
                boxShadowSecondary: '0 24px 60px rgba(19, 62, 31, 0.12)',
              },
              components: {
                Layout: {
                  headerBg: '#ffffff',
                  bodyBg: '#f4f8f1',
                  footerBg: '#ffffff',
                },
                Card: {
                  borderRadiusLG: 24,
                },
                Button: {
                  controlHeight: 42,
                },
                Table: {
                  paddingContentVerticalLG: 8,
                },
                Menu: {
                  itemBorderRadius: 14,
                  itemSelectedBg: '#e8f6eb',
                  itemSelectedColor: '#106b28',
                  itemHoverColor: '#106b28',
                  horizontalItemSelectedColor: '#106b28',
                  horizontalItemHoverColor: '#106b28',
                  horizontalItemBorderRadius: 14,
                },
              },
            }}
          >
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="hoc-sinh" element={<ProtectedRoute module="hoc-sinh"><Students /></ProtectedRoute>} />
                    <Route path="suat-an" element={<ProtectedRoute module="suat-an"><Meals /></ProtectedRoute>} />
                    <Route path="dinh-muc-xe" element={<ProtectedRoute module="dinh-muc-xe"><Transport /></ProtectedRoute>} />
                    <Route path="bao-hiem" element={<ProtectedRoute module="bao-hiem"><Insurance /></ProtectedRoute>} />
                    <Route path="thanh-toan" element={<ProtectedRoute module="thanh-toan"><Payments /></ProtectedRoute>} />
                    <Route path="cms" element={<CmsRoute><CmsAdminPage /></CmsRoute>} />
                    <Route path="danh-muc-master" element={<AdminRoute><MasterData /></AdminRoute>} />
                    <Route path="nguoi-dung" element={<AdminRoute><Users /></AdminRoute>} />
                    <Route path="cds/dashboard" element={<ProtectedRoute module="cds"><CdsDashboard /></ProtectedRoute>} />
                    <Route path="cds/evaluations" element={<ProtectedRoute module="cds"><CdsEvaluations /></ProtectedRoute>} />
                    <Route path="cds/evaluations/new" element={<ProtectedRoute module="cds"><CdsEvaluationForm /></ProtectedRoute>} />
                    <Route path="cds/evaluations/:id" element={<ProtectedRoute module="cds"><CdsEvaluationForm /></ProtectedRoute>} />
                    <Route path="cds/evaluations/print/:id" element={<ProtectedRoute module="cds"><CdsEvaluationPrint /></ProtectedRoute>} />
                    <Route path="cds/admin/periods" element={<AdminRoute><CdsAdminPeriods /></AdminRoute>} />
                    <Route path="cds/admin/periods/print/:id" element={<AdminRoute><CdsPeriodPrint /></AdminRoute>} />
                  </Route>
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<PublicHomePage />} />
                    <Route path="admin/login" element={<Login />} />
                    <Route path="*" element={<PublicCmsPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
