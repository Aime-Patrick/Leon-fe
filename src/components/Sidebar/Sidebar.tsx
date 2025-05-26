/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaWhatsapp, FaEnvelope, FaFacebook, FaTiktok } from "react-icons/fa";
import { useAppConfig } from "../../hooks/useAppConfig";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = ({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const { data, isLoading } = useAppConfig();
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  // const toggleSidebar = () => setIsOpen(!isOpen);
  // const toggleChannel = () => setChannelOpen((prev) => !prev);

  useEffect(() => {
    // setActivePath(location.pathname);
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Helper to check if any channel is active
  // const isChannelActive = [
  //   "/dashboard/whatsapp",
  //   "/dashboard/instagram",
  //   "/dashboard/gmail",
  //   "/dashboard/facebook",
  // ].includes(activePath);

  const navigation = [
    { name: "Dashboard", path: "/", icon: <MdDashboard /> },
    { 
      name: "WhatsApp", 
      path: "/whatsapp", 
      icon: <FaWhatsapp />,

    },
    { 
      name: "Gmail", 
      path: "/gmail", 
      icon: <FaEnvelope />,

    },
    { 
      name: "Facebook", 
      path: "/facebook", 
      icon: <FaFacebook />,
     
    },
    {
      name: "TikTok",
      path: "/tiktok",
      icon: <FaTiktok />
    }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
    );
}

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.sidebarHeader}>
        {!isCollapsed && (
          <div className="flex gap-1 items-center justify-center px-3">
            {data?.logoUrl && (
              <img
                src={data.logoUrl}
                alt="App Logo"
                className="h-10 w-10 object-contain"
              />
            )}
            <h2 className={styles.logo}>{data?.appName || "Leon"}</h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={styles.collapseButton}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <div className={styles.userInfo}>
        {!isCollapsed && user && (
          <div className={styles.userDetails}>
            <div className={styles.avatar}>{user.name?.charAt(0) || "U"}</div>
            <div className={styles.userName}>{user.name}</div>
          </div>
        )}
      </div>

      <nav className={styles.navigation}>
        {navigation.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              isActive(item.path) ? styles.active : ""
            }`}
            title={isCollapsed ? item.name : ""}
          >
            <span className={styles.icon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.label}>{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          title={isCollapsed ? "Logout" : ""}
        >
          <MdLogout />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
