import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Birthdays from "./pages/Birthdays";
import StudentDetails from "./pages/StudentDetails";
import AddStudent from "./pages/AddStudent";
import Update from "./pages/Update";
import Categories from "./pages/Categories";
import Education from "./pages/Education";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Whatsapp from "./pages/Whatsapp";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/birthdays" element={<ProtectedRoute><Birthdays /></ProtectedRoute>} />
      <Route path="/students/add" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />
      <Route path="/students/:id/edit" element={<ProtectedRoute><AddStudent /></ProtectedRoute>} />
      <Route path="/update" element={<ProtectedRoute><Update /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />

      <Route path="/whatsapp" element={<ProtectedRoute><Whatsapp /></ProtectedRoute>} />

      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes >
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
