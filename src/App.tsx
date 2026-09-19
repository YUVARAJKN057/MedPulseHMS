import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';
import DoctorList from './pages/doctors/DoctorList';
import PatientList from './pages/patients/PatientList';
import AppointmentManager from './pages/appointments/AppointmentManager';
import BillingManager from './pages/billing/BillingManager';
import MedicalRecords from './pages/records/MedicalRecords';
import BedManagement from './pages/inventory/BedManagement';
import DashboardLayout from './layouts/DashboardLayout';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Common Routes shared across dashboards */}
            <Route path="doctors" element={<DoctorList />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="appointments" element={<AppointmentManager />} />
            <Route path="billing" element={<BillingManager />} />
            <Route path="records" element={<MedicalRecords />} />
            <Route path="beds" element={<BedManagement />} />

            {/* Role Specific Dashboards */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="receptionist" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
            
            <Route index element={<DashboardRedirect />} />
          </Route>
          
          <Route path="/unauthorized" element={<div className="h-screen flex items-center justify-center">Unauthorized Access</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function DashboardRedirect() {
  const { user, profile } = useAuth();
  if (user && !profile) return <Navigate to="/register" replace />;
  if (!profile) return null;
  return <Navigate to={`/dashboard/${profile.role}`} replace />;
}
