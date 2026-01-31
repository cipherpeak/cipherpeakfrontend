





import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Clients from "./pages/Clients";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./lib/PrivateRoute";
import Dolla from "./pages/Dolla";
import LeaveManagement from "./pages/LeaveManagement";
import LeaveApplications from "./pages/LeaveApplications";
import Verification from "./pages/Verification";
import ClientDetails from "./pages/ClientDetails";
import Reports from "./pages/Reports";
import ClientReportDetail from "./pages/ClientReportDetail";
import EmployeeReportDetail from "./pages/EmployeeReportDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="employees"
              element={
                <PrivateRoute>
                  <Employees />
                </PrivateRoute>
              }
            />
            <Route
              path="clients"
              element={
                <PrivateRoute>
                  <Clients />
                </PrivateRoute>
              }
            />
            <Route
              path="tasks"
              element={
                <PrivateRoute>
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route
              path="calendar"
              element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="leave-management"
              element={
                <PrivateRoute>
                  <LeaveManagement />
                </PrivateRoute>
              }
            />

            <Route
              path="leave-applications"
              element={
                <PrivateRoute>
                  <LeaveApplications />
                </PrivateRoute>
              }
            />


            <Route
              path="dolla"
              element={
                <PrivateRoute>
                  <Dolla />
                </PrivateRoute>
              }
            />

            <Route
              path="verification"
              element={
                <PrivateRoute>
                  <Verification />
                </PrivateRoute>
              }
            />

            <Route
              path="client-details/:clientId"
              element={
                <PrivateRoute>
                  <ClientDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />

            <Route
              path="reports/client/:id"
              element={
                <PrivateRoute>
                  <ClientReportDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="reports/employee/:id"
              element={
                <PrivateRoute>
                  <EmployeeReportDetail />
                </PrivateRoute>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;