import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const logoutUser = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h1 style={{ opacity: collapsed ? 0 : 1, transform: collapsed ? "translateX(-20px)" : "translateX(0)" }}>
          AutoVAPT
        </h1>
        {collapsed && <h1>AV</h1>} {/* Short logo when collapsed */}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "➡" : "⬅"}
        </button>
      </div>

      {/* Menu */}
      <ul className="menu">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/scan"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>🛡</span>
            {!collapsed && <span>New Scan</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/vulnerabilities"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>⚠</span>
            {!collapsed && <span>Vulnerabilities</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>📄</span>
            {!collapsed && <span>Reports</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>⚙</span>
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span>👑</span>
            {!collapsed && <span>Admin</span>}
          </NavLink>
        </li>
      </ul>

      {/* Logout Button */}
      <button className="logout-btn" onClick={logoutUser}>
        🚪 {!collapsed && "Logout"}
      </button>
    </div>
  );
}

export default Sidebar;