/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetupProvider } from "./contexts/SetupContext";
import SetupWizard from "./pages/setup/SetupWizard";
import Login from "./pages/auth/Login";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import Gmail from "./pages/gmail/Gmail";
import GoogleCallback from "./pages/GoogleCallback";
import AuthError from "./pages/auth/AuthError";
import Sidebar from "./components/Sidebar/Sidebar";
import { useState, useEffect } from "react";
import axiosInstance from "./utils/axios";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { CustomToaster } from "./utils/toast";
import { WhatsAppConsole } from "./components/whatsapp/whatsapp";
import Profile from "./pages/profile/Profile";
import Facebook from "./pages/facebook/Facebook";
import FacebookCallback from "./pages/facebook/FacebookCallback";
import TikTok from "./pages/tiktok/TikTok";
import CreateCampaign from "./pages/facebook/CreateCampaign";
import Instagram from "./pages/instagram/Instagram";
import CreatePost from "./pages/instagram/CreatePost";
import InstagramCallback from "./pages/instagram/InstagramCallback";
import Register from "./pages/auth/Register";
const queryClient = new QueryClient();

// Layout component for authenticated routes
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`flex-1 overflow-auto ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await axiosInstance.get("/api/setup/status");
        setIsSetupComplete(response.data.isSetupComplete);
      } catch (error) {
        console.error("Failed to check setup status:", error);
        setIsSetupComplete(false);
      }
    };

    checkSetupStatus();
  }, []);

  if (isSetupComplete === null) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SetupProvider>
        <Router>
          <CustomToaster />
          <Routes>
            {!isSetupComplete ? (
              <Route path="*" element={<SetupWizard />} />
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/auth/gmail/callback"
                  element={<GoogleCallback />}
                />
                <Route
                  path="/auth/facebook/callback"
                  element={<FacebookCallback />}
                />
                <Route
                  path="/auth/instagram/callback"
                  element={<InstagramCallback />}
                />
                <Route path="/auth/error" element={<AuthError />} />
                <Route
                  path="/facebook/campaigns/new"
                  element={<CreateCampaign />}
                />
                <Route path="/register" element={<Register />} />

                {/* Authenticated routes */}
                <Route
                  path="/*"
                  element={
                    <AuthenticatedLayout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="gmail" element={<Gmail />} />
                        <Route path="whatsapp" element={<WhatsAppConsole />} />
                        <Route path="facebook" element={<Facebook />} />
                        <Route path="tiktok" element={<TikTok />} />
                        <Route path="instagram" element={<Outlet />}>
                          <Route index element={<Instagram />} />
                          <Route path="media/new" element={<CreatePost />} />
                        </Route>
                        <Route path="profile" element={<Profile />} />
                      </Routes>
                    </AuthenticatedLayout>
                  }
                />
              </>
            )}
          </Routes>
        </Router>
      </SetupProvider>
    </QueryClientProvider>
  );
};

export default App;
