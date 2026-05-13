import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import NavbarOS from "../../components/NavbarOS";
import "./AdminDashboard.css";

const tabs = [
  { name: "Members", path: "/admin" },
  { name: "Anime", path: "/admin/anime" },
  { name: "Analytics", path: "/admin/analytics" },
];

function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // 기본 경로에서 /admin이면 members로 리다이렉트
    if (location.pathname === "/admin") {
      navigate("/admin", { replace: true });
    }
  }, []); // 무한루프 방지: 빈 배열로 수정

  return (
    <>
      <NavbarOS />
      <main className="admin-dashboard-main">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <div className="admin-dashboard-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                isActive ? "admin-tab active" : "admin-tab"
              }
              end={tab.path === "/admin"}
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
        <div className="admin-dashboard-content">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default AdminDashboard;
