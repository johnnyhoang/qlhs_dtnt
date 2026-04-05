import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfigProvider } from 'antd';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Meals from './pages/Meals';
import Transport from './pages/Transport';
import Insurance from './pages/Insurance';
import Payments from './pages/Payments';
import Users from './pages/Users';
import MasterData from './pages/MasterData';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import CdsDashboard from './pages/cds/CdsDashboard';
import CdsEvaluations from './pages/cds/CdsEvaluations';
import CdsEvaluationForm from './pages/cds/CdsEvaluationForm';
import CdsAdminPeriods from './pages/cds/CdsAdminPeriods';
import CdsEvaluationPrint from './pages/cds/CdsEvaluationPrint';
import CdsPeriodPrint from './pages/cds/CdsPeriodPrint';
import CmsAdminPage from './pages/CmsAdminPage';
import PublicHomePage from './pages/public/PublicHomePage';
import PublicCmsPage from './pages/public/PublicCmsPage';
import { AuthProvider } from './contexts/AuthContext';
import { WEB_ENV } from './config/env';

const queryClient = new QueryClient();

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
                fontSize: 13,
                borderRadius: 4,
              },
              components: {
                Table: {
                  paddingContentVerticalLG: 8,
                },
              },
            }}
          >
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<Login />} />
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
                  <Route path="*" element={<PublicCmsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
