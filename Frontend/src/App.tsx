import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth-context";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import MockGoogleLoginPage from "./pages/MockGoogleLoginPage";
import Dashboard from "./pages/Dashboard";
import BudgetsPage from "./pages/BudgetsPage";
import ContactsPage from "./pages/ContactsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ProductsPage from "./pages/ProductsPage";
import CostCentersPage from "./pages/CostCentersPage";
import AutoRulesPage from "./pages/AutoRulesPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import VendorBillsPage from "./pages/VendorBillsPage";
import SalesOrdersPage from "./pages/SalesOrdersPage";
import BudgetVsActualPage from "./pages/BudgetVsActualPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import UsersPage from "./pages/UsersPage";

import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";
import VendorPaymentsPage from "./pages/VendorPaymentsPage";
import CustomerPaymentsPage from "./pages/CustomerPaymentsPage";

import CostCenterProfitabilityPage from "./pages/CostCenterProfitabilityPage";
import SettingsPage from "./pages/SettingsPage";
import HelpSupportPage from "./pages/HelpSupportPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Routes - Both ADMIN and PORTAL use same layout */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "PORTAL"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Account Menu Routes (Master Data) */}
                <Route path="/account/contacts" element={<ContactsPage />} />
                <Route path="/account/products" element={<ProductsPage />} />
                <Route path="/account/analytical-accounts" element={<CostCentersPage />} />
                <Route path="/account/auto-models" element={<AutoRulesPage />} />
                <Route path="/account/budgets" element={<BudgetsPage />} />

                {/* Purchase Menu Routes */}
                <Route path="/purchase/orders" element={<PurchaseOrdersPage />} />
                <Route path="/purchase/bills" element={<VendorBillsPage />} />
                <Route path="/purchase/payments" element={<VendorPaymentsPage />} />

                {/* Sale Menu Routes */}
                <Route path="/sale/orders" element={<SalesOrdersPage />} />
                <Route path="/sale/invoices" element={<InvoicesPage />} />
                <Route path="/sale/receipts" element={<CustomerPaymentsPage />} />

                {/* Report Routes */}
                <Route path="/reports/budget-actual" element={<BudgetVsActualPage />} />
                <Route path="/reports/cost-center-pl" element={<CostCenterProfitabilityPage />} />

                {/* User Management (Admin Only) */}
                <Route path="/users" element={<UsersPage />} />

                {/* Other Routes */}
                <Route path="/ai-insights" element={<AIInsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpSupportPage />} />

                {/* Legacy route redirects */}
                <Route path="/masters/contacts" element={<Navigate to="/account/contacts" replace />} />
                <Route path="/masters/products" element={<Navigate to="/account/products" replace />} />
                <Route path="/masters/cost-centers" element={<Navigate to="/account/analytical-accounts" replace />} />
                <Route path="/masters/auto-rules" element={<Navigate to="/account/auto-models" replace />} />
                <Route path="/budgets" element={<Navigate to="/account/budgets" replace />} />
                <Route path="/purchases/orders" element={<Navigate to="/purchase/orders" replace />} />
                <Route path="/purchases/bills" element={<Navigate to="/purchase/bills" replace />} />
                <Route path="/purchases/payments" element={<Navigate to="/purchase/payments" replace />} />
                <Route path="/accounting/vendor-payments" element={<Navigate to="/purchase/payments" replace />} />
                <Route path="/sales/orders" element={<Navigate to="/sale/orders" replace />} />
                <Route path="/sales/invoices" element={<Navigate to="/sale/invoices" replace />} />
                <Route path="/sales/receipts" element={<Navigate to="/sale/receipts" replace />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
