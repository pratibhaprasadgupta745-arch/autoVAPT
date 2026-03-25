import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// ================= AUTH HEADER =================
const authHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("❌ No token found. Please login again.");
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ================= USERS =================
export const getUsers = async () => {
  try {
    const res = await axios.get(`${API_BASE}/users/`, authHeader());
    return res.data;
  } catch (err) {
    console.error("❌ getUsers error:", err.response?.data || err.message);
    throw err;
  }
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_BASE}/users/${id}`, authHeader());
  return res.data;
};

// ================= ROLE SYSTEM =================
export const updateRole = async (id, role) => {
  const res = await axios.put(
    `${API_BASE}/users/${id}/role?role=${role}`,
    {},
    authHeader()
  );
  return res.data;
};

export const makeAdmin = async (id) => {
  const res = await axios.put(
    `${API_BASE}/users/${id}/make-admin`,
    {},
    authHeader()
  );
  return res.data;
};

export const removeAdmin = async (id) => {
  const res = await axios.put(
    `${API_BASE}/users/${id}/remove-admin`,
    {},
    authHeader()
  );
  return res.data;
};

// ================= BLOCK SYSTEM =================
export const blockUser = async (id) => {
  const res = await axios.put(
    `${API_BASE}/users/${id}/block`,
    {},
    authHeader()
  );
  return res.data;
};

export const unblockUser = async (id) => {
  const res = await axios.put(
    `${API_BASE}/users/${id}/unblock`,
    {},
    authHeader()
  );
  return res.data;
};

// ================= ADD USER =================
export const addUser = async (userData) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(`${API_BASE}/users/`, userData, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return res.data;
};