import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/theme.css";

import {
  getUsers,
  deleteUser,
  makeAdmin,
  removeAdmin,
  blockUser,
  unblockUser
} from "../api";

function Admin() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");

  const [logs, setLogs] = useState([]);
  const [systemStatus] = useState("ONLINE");

  // ================= LOAD USERS =================
  useEffect(() => {
    loadUsers();

    const interval = setInterval(() => {
      loadUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);

      // STOP SPAM IF NOT ADMIN
      if (err.response?.status === 403) {
        console.warn("🚫 Admin access required");
        setUsers([]);
      }
    }
  };

  // ================= ALERTS =================
  useEffect(() => {
    let list = [];

    if (users.length > 15) list.push("⚠️ High user density detected");

    const admins = users.filter(u => u.role === "admin").length;
    const blocked = users.filter(u => !u.is_active).length;

    if (users.length > 0 && admins === 0)
      list.push("🚨 CRITICAL: No admin in system");

    if (blocked > 0)
      list.push(`🔒 ${blocked} users blocked`);

    setAlerts(list);
  }, [users]);

  // ================= LIVE LOG =================
  const getRandomLog = () => {
    const logs = [
      "User authentication verified",
      "Scan engine running...",
      "Suspicious activity detected",
      "Firewall rules updated",
      "New login from unknown IP",
      "Vulnerability scan completed",
      "Admin privilege checked",
      "System integrity OK"
    ];
    return logs[Math.floor(Math.random() * logs.length)];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        message: getRandomLog(),
        time: new Date().toLocaleTimeString()
      };
      setLogs(prev => [newLog, ...prev.slice(0, 8)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ================= ACTIONS =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete user permanently?")) return;
    await deleteUser(id);
    loadUsers();
  };

  const handleMakeAdmin = async (id) => {
    await makeAdmin(id);
    loadUsers();
  };

  const handleRemoveAdmin = async (id) => {
    await removeAdmin(id);
    loadUsers();
  };

  const handleBlockToggle = async (user) => {
    try {
      if (user.is_active) {
        await blockUser(user.id);
      } else {
        await unblockUser(user.id);
      }
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FILTER =================
  const filteredUsers = users
    .filter(u => u.email?.toLowerCase().includes(search.toLowerCase()))
    .filter(u => roleFilter === "all" ? true : u.role === roleFilter);

  return (
    <div className="admin-page min-h-screen p-6 text-white">

      {/* HEADER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-4xl font-extrabold text-cyan-safe">
          🛡️ SOC CONTROL CENTER
        </h1>
        <p className="text-gray-400">
          Real-time Security Monitoring Dashboard
        </p>
      </motion.div>

      {/* SYSTEM STATUS */}
      <div className="mb-4 flex items-center gap-3">
        <div className="status-dot status-online"></div>
        <span className="text-sm text-gray-300">
          System Status: <b className="text-green-safe">{systemStatus}</b>
        </span>
      </div>

      {/* ALERTS */}
      <div className="mb-5">
        {alerts.map((a, i) => (
          <div key={i} className="alert">
            {a}
          </div>
        ))}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-card p-4 glow-cyan">
          <p>Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>

        <div className="bg-card p-4 glow-red">
          <p>Admins</p>
          <p className="text-2xl font-bold">
            {users.filter(u => u.role === "admin").length}
          </p>
        </div>

        <div className="bg-card p-4 glow-green">
          <p>Active</p>
          <p className="text-2xl font-bold">
            {users.filter(u => u.is_active).length}
          </p>
        </div>

        <div className="bg-card p-4">
          <p>Blocked</p>
          <p className="text-2xl font-bold text-yellow-safe">
            {users.filter(u => !u.is_active).length}
          </p>
        </div>

      </div>

      {/* LIVE FEED */}
      <div className="live-feed mb-6">
        <h2 className="text-cyan-safe font-bold mb-2">
          ⚡ LIVE SECURITY FEED
        </h2>

        <div className="max-h-48 overflow-auto">
          {logs.map(log => (
            <div key={log.id} className="live-log">
              <span>[{log.time}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3 mb-5 flex-wrap">

        <input
          className="bg-input"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="bg-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="rounded shadow overflow-x-auto">

        <table>

          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.map(user => (

              <tr key={user.id}>

                <td>{user.id}</td>
                <td>{user.email}</td>

                <td className={user.role === "admin" ? "status-admin" : "status-active"}>
                  {user.role.toUpperCase()}
                </td>

                <td>
                  <button
                    onClick={() => handleBlockToggle(user)}
                    className={user.is_active ? "status-active" : "status-blocked"}
                  >
                    {user.is_active ? "ACTIVE" : "BLOCKED"}
                  </button>
                </td>

                <td className="flex gap-2 flex-wrap">

                  {user.role !== "admin" ? (
                    <button onClick={() => handleMakeAdmin(user.id)} className="btn-primary">
                      Make Admin
                    </button>
                  ) : (
                    <button onClick={() => handleRemoveAdmin(user.id)} className="btn-warning">
                      Remove Admin
                    </button>
                  )}

                  <button onClick={() => handleDelete(user.id)} className="btn-danger">
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Admin;