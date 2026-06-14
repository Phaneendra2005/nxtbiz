import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import { AppLayout } from "./components/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { UsersPage } from "./pages/UsersPage.jsx";
import { CustomersPage } from "./pages/CustomersPage.jsx";
import { CustomerDetailPage } from "./pages/CustomerDetailPage.jsx";
import { EmailsPage } from "./pages/EmailsPage.jsx";
import { CrmPage } from "./pages/CrmPage.jsx";
import { MeetingsPage } from "./pages/MeetingsPage.jsx";
import { InvoicesPage } from "./pages/InvoicesPage.jsx";
import { TicketsPage } from "./pages/TicketsPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { WorkflowsPage } from "./pages/WorkflowsPage.jsx";
import { AiControlPage } from "./pages/AiControlPage.jsx";
import { NotificationsPage } from "./pages/NotificationsPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

export default function App() {
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/emails" element={<EmailsPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/ai-control" element={<AiControlPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
