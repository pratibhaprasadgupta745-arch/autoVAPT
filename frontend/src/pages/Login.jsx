import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./login.css";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username: email,   // ⚠️ FastAPI expects username
          password: password
        })
      });

      const data = await res.json();

      // ================= ERROR HANDLE =================
      if (!res.ok) {
        console.error("❌ Login failed:", data);
        throw new Error(data.detail || "Login failed");
      }

      // ================= SAVE TOKEN =================
      if (!data.access_token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", data.access_token);

      // ================= DEBUG =================
      console.log("✅ TOKEN SAVED:", data.access_token);

      // OPTIONAL: decode payload (for debug only)
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        console.log("🧠 TOKEN DATA:", payload);
      } catch (e) {
        console.warn("Token decode failed");
      }

      alert("Login successful");

      // ================= REDIRECT =================
      navigate("/dashboard");

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        <h1 className="logo">🛡 AutoVAPT</h1>

        <p className="subtitle">
          Automated Vulnerability Assessment & Penetration Testing Platform
        </p>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <div className="password-box">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="links">

          <span onClick={() => navigate("/forgot-password")} className="link">
            Forgot Password
          </span>

          <span onClick={() => navigate("/register")} className="link">
            Create Account
          </span>

        </div>

      </div>

    </div>
  );
}